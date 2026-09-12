import mongoose, { Schema, type Document } from "mongoose";
import bcrypt from "bcryptjs";

export async function connectDB(): Promise<void> {
  // Read lazily (not at module load) so this always sees dotenv.config()'s values, regardless of
  // import order relative to that call in the entrypoint.
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fluenxia";
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log(`[db] Connected to MongoDB (${uri.replace(/\/\/[^@]+@/, "//<redacted>@")})`);
}

// ============================================================================
// USER ACCOUNT
// ============================================================================

export interface UserDoc extends Document {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  role: "student" | "admin" | "owner";
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt: string;
  status: "active" | "suspended";
  progress: any;
  googleId?: string;
  appleId?: string;
  authProvider?: "google" | "email" | "phone" | "apple" | "guest";
  emailVerified?: boolean;
  isGuest?: boolean;
  passwordHash?: string;
  consent?: {
    ageAndTermsAcceptedAt?: string;
    aiTrainingOptIn?: boolean;
    marketingOptIn?: boolean;
  };
  subscription?: {
    tier: "free" | "plus" | "pro" | "sachet";
    status: "active" | "expired" | "none";
    startedAt?: string;
    expiresAt?: string;
    planId?: string;
    cashfreeOrderId?: string;
    lastPaymentId?: string;
  };
  // Owner-managed, admin-only access control -- see the comment on UserAccount.allowedSections
  // in src/types.ts for the full semantics (undefined = full access).
  allowedSections?: string[];
}

const userSchema = new Schema<UserDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, index: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, index: true, sparse: true },
    countryCode: String,
    role: { type: String, enum: ["student", "admin", "owner"], default: "student" },
    avatarUrl: String,
    createdAt: { type: String, required: true },
    lastLoginAt: { type: String, required: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    progress: { type: Schema.Types.Mixed, default: {} },
    googleId: { type: String, index: true, sparse: true },
    appleId: { type: String, index: true, sparse: true },
    authProvider: { type: String, enum: ["google", "email", "phone", "apple", "guest"] },
    emailVerified: Boolean,
    isGuest: Boolean,
    passwordHash: String,
    consent: {
      ageAndTermsAcceptedAt: String,
      aiTrainingOptIn: Boolean,
      marketingOptIn: Boolean,
    },
    subscription: {
      tier: { type: String, enum: ["free", "plus", "pro", "sachet"], default: "free" },
      status: { type: String, enum: ["active", "expired", "none"], default: "none" },
      startedAt: String,
      expiresAt: String,
      planId: String,
      cashfreeOrderId: String,
      lastPaymentId: String,
    },
    allowedSections: { type: [String], default: undefined },
  },
  { versionKey: false }
);

export const UserModel = mongoose.model<UserDoc>("User", userSchema);

// ============================================================================
// PAYMENT ORDERS (Cashfree) — every order we create is recorded here immediately, independent
// of the webhook, so we can reconcile "created but never paid" orders and have an audit trail
// that isn't solely dependent on Cashfree's webhook actually reaching us.
// ============================================================================

export interface PaymentOrderDoc extends Document {
  orderId: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed" | "expired";
  cashfreePaymentSessionId?: string;
  cashfreePaymentId?: string;
  createdAt: string;
  paidAt?: string;
  rawWebhookPayload?: any;
}

const paymentOrderSchema = new Schema<PaymentOrderDoc>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "paid", "failed", "expired"], default: "created" },
    cashfreePaymentSessionId: String,
    cashfreePaymentId: String,
    createdAt: { type: String, required: true },
    paidAt: String,
    rawWebhookPayload: Schema.Types.Mixed,
  },
  { versionKey: false }
);

export const PaymentOrderModel = mongoose.model<PaymentOrderDoc>("PaymentOrder", paymentOrderSchema);

export const paymentOrderStore = {
  async create(order: Omit<PaymentOrderDoc, keyof Document>) {
    await PaymentOrderModel.create(order);
  },
  async getByOrderId(orderId: string) {
    const doc = await PaymentOrderModel.findOne({ orderId });
    if (!doc) return null;
    const obj = doc.toObject();
    delete (obj as any)._id;
    return obj;
  },
  async markPaid(orderId: string, paymentId: string, rawWebhookPayload?: any) {
    await PaymentOrderModel.findOneAndUpdate(
      { orderId },
      { $set: { status: "paid", cashfreePaymentId: paymentId, paidAt: new Date().toISOString(), rawWebhookPayload } }
    );
  },
  async markFailed(orderId: string, rawWebhookPayload?: any) {
    await PaymentOrderModel.findOneAndUpdate({ orderId }, { $set: { status: "failed", rawWebhookPayload } });
  },
  async listByUser(userId: string) {
    const docs = await PaymentOrderModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map((d) => {
      const obj = d.toObject();
      delete (obj as any)._id;
      return obj;
    });
  },
  // Admin-facing: every order ever created, newest first, for the Subscriptions & Revenue panel.
  async listAll(limit = 500) {
    const docs = await PaymentOrderModel.find({}).sort({ createdAt: -1 }).limit(limit);
    return docs.map((d) => {
      const obj = d.toObject();
      delete (obj as any)._id;
      return obj;
    });
  },
};

// ============================================================================
// PLANS (admin-editable pricing) -- cashfree.ts's PLANS constant remains the source of truth
// for which plan IDs exist and their fallback defaults; this collection lets an admin override
// name/price/duration/description per plan without a code deploy. Every place that charges a
// customer (checkout, the public pricing list) reads through effectivePlans() below rather than
// the static PLANS object directly, so an edit here actually changes what Cashfree bills.
// ============================================================================

export interface PlanDoc extends Document {
  id: string;
  tier: string;
  name: string;
  amountInr: number;
  durationDays: number;
  description: string;
  updatedAt: string;
}

const planSchema = new Schema<PlanDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    tier: { type: String, required: true },
    name: { type: String, required: true },
    amountInr: { type: Number, required: true },
    durationDays: { type: Number, required: true },
    description: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false }
);

export const PlanModel = mongoose.model<PlanDoc>("Plan", planSchema);

export const planStore = {
  async getAll() {
    const docs = await PlanModel.find({});
    return docs.map((d) => {
      const obj = d.toObject();
      delete (obj as any)._id;
      return obj;
    });
  },
  async upsert(plan: Omit<PlanDoc, keyof Document>) {
    await PlanModel.findOneAndUpdate({ id: plan.id }, { $set: plan }, { upsert: true });
  },
};

// ============================================================================
// SITE SETTINGS (CMS) -- a single document holding editable, site-wide content: contact info,
// the platform tagline, the logo, and the Terms of Usage / Privacy Policy body text. Both the
// in-app LegalModal and the server-rendered /terms & /privacy pages read from this same document,
// so there is exactly one place these get edited instead of two hardcoded copies drifting apart.
// ============================================================================

const SITE_SETTINGS_ID = "default";

export interface SiteSettingsDoc extends Document {
  id: string;
  contactEmail: string;
  salesEmail: string;
  contactPhone?: string;
  platformTagline: string;
  logoUrl?: string;
  termsContent: string;
  privacyContent: string;
  updatedAt: string;
}

const siteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    contactEmail: { type: String, required: true },
    salesEmail: { type: String, required: true },
    contactPhone: String,
    platformTagline: { type: String, required: true },
    logoUrl: String,
    termsContent: { type: String, required: true },
    privacyContent: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false }
);

export const SiteSettingsModel = mongoose.model<SiteSettingsDoc>("SiteSettings", siteSettingsSchema);

// Defaults seeded on first read -- carries over the real Terms/Privacy prose that used to be
// hardcoded in server.ts's /terms and /privacy routes (and duplicated again in LegalModal.tsx),
// so switching those pages over to read from this document is not a content regression. Body
// text uses a small "## heading" / "- bullet" convention (see renderLegalMarkup in server.ts and
// the matching renderer in LegalModal.tsx) rather than full Markdown, since no Markdown library
// is installed for this project -- lines starting with "## " become section headings, "- " lines
// become bullets, and blank-line-separated blocks become paragraphs.
//
// The Google API Limited Use Disclosure clause on the Privacy page is intentionally NOT part of
// this editable content -- it stays hardcoded in server.ts because it is boilerplate required by
// Google's OAuth verification, not something that should be casually rewritten from the CMS.
const DEFAULT_SITE_SETTINGS: Omit<SiteSettingsDoc, keyof Document> = {
  id: SITE_SETTINGS_ID,
  contactEmail: "reganakasieswaramma@fluenxiaapp.com",
  salesEmail: "reganakasieswaramma@fluenxiaapp.com",
  contactPhone: "",
  platformTagline: "Empower Learning, Unleash Potential.",
  logoUrl: "",
  termsContent: `By accessing or using the Fluenxia mobile application, website (www.fluenxiaapp.com), or related services ("Services"), operated by Fluenxia Inc. and its registered owner Regana Kasieswaramma ("Company", "we", "us"), you agree to be bound by these Terms of Usage. If you do not agree, you must not access or use the Services.

## Acceptance of Terms
By accessing or using the Services, you agree to be bound by these Terms of Usage ("Terms"). If you do not agree to these Terms, you must not access or use the Services.

## Description of Services & AI Educational Disclaimer
Fluenxia provides an AI-powered conversational language tutoring platform incorporating real-time speech-to-text, acoustic formant analysis, and automated grammar feedback aligned with CEFR benchmarks.
- Educational Tool Only: Fluenxia is an independent learning tool. It is not affiliated with, endorsed by, or accredited by IELTS, Cambridge Assessment, or any official testing body.
- No Guarantee: Fluenxia does not guarantee specific exam scores, professional certifications, or employment outcomes.
- AI Output & Hallucination Disclaimer: you acknowledge and agree that the lessons, dynamic conversational roleplays, oral feedback, score evaluations, and diagnostic feedback provided across the Services are generated by automated Artificial Intelligence (AI) algorithms and Large Language Models (LLMs). While Fluenxia strives for high pedagogical precision, AI-generated content is probabilistic and may occasionally contain errors, inaccuracies, or hallucinations. Fluenxia does not warrant that AI-generated feedback is completely error-free or suitable as an official accreditation.

## Account Registration & Age Eligibility
Users must be at least 18 years of age (or the legal age of majority) to register independently. Users under 18 may only use the platform under the supervision of a parent or legal guardian who accepts these Terms and provides verifiable consent.

## Subscriptions, Trials, and Auto-Renewal
Fluenxia may offer free or discounted trials (e.g., 7-day trials). Unless canceled prior to the trial expiration, the subscription automatically converts into a paid recurring plan at the rates displayed at checkout. Subscriptions automatically renew until canceled via account settings or the respective app store. Fees are inclusive/exclusive of statutory taxes as indicated at purchase.

## Proprietary Rights & Prohibited Conduct
All software, algorithms, speech models, prompt libraries, assessment frameworks, and the proprietary English Grammar Curriculum are the exclusive Intellectual Property of the Company. Users shall not: (i) reverse engineer, decompile, or extract the source code or voice pipeline; (ii) use automated bots or scrapers to bypass the Anti-Gaming Engine or extract curriculum materials; or (iii) upload unlawful or infringing content.

## Anti-Gaming Heuristics & System Integrity
To maintain standard assessment validity, Fluenxia monitors response timing, keystroke patterns, and interaction metrics. Suspicious activities indicative of automated scripts or spoofing may result in standard score invalidation or account suspension.

## Limitation of Liability
To the maximum extent permitted by law, Fluenxia Inc. shall not be liable for indirect, incidental, or consequential damages. Total aggregate liability for any claims under these Terms shall be limited to the total amount paid by the user to Fluenxia in the twelve (12) months preceding the claim.

## Governing Law & Dispute Resolution
These Terms are governed by the laws of India. Any legal dispute arising out of these Terms shall be settled by binding arbitration under the Arbitration and Conciliation Act, 1996, with the venue of arbitration in Hyderabad, Telangana, India.`,
  privacyContent: `Fluenxia Inc. operates as the Data Fiduciary (Data Controller). We do not sell your personal data.

## Data Fiduciary & Contact Details
Data Protection Officer: Regana Kasieswaramma. Contact channels: support@fluenxiaapp.com | privacy@fluenxiaapp.com

## Categories of Personal Data Collected
- Identity & Contact Data: name, email address, user credentials, and billing details.
- Acoustic & Voice Data: audio recordings of spoken assessments, voice practice sessions, real-time conversation streams, pitch contours, and formant speech features.
- Text & Assessment Data: transcripts, written benchmark tests, error history, and CEFR progress scores.
- Technical & Behavioral Data: IP address, device identifiers, keystroke timing, and response latency heuristics.

## Purposes of Data Processing & Legal Basis
- Service Provision (Contract / Consent): generating real-time voice feedback, STT transcripts, acoustic analysis, and CEFR evaluations through automated AI models. Users are advised that AI processing is probabilistic and output may occasionally exhibit inaccuracies or hallucinations.
- System Security & Anti-Gaming (Legitimate Interest / Statutory Duty): analyzing keystrokes and timing parameters to verify authentic human interaction and prevent assessment gaming.
- AI Model Improvement (Explicit Opt-In Consent): fine-tuning proprietary speech recognition models using anonymized audio and text data.

## Data Sharing & Third-Party Processors
We do not sell personal data. Data is shared strictly with:
- Cloud & AI Pipeline Providers: managed infrastructure processing voice streams under strict non-retention Data Processing Agreements (DPAs).
- Payment Processors: secure gateways handling subscription billing transactions.
- Human-in-the-Loop (HITL) Linguists: certified human evaluators reviewing flagged audio samples or disputed AI outputs in the queue for assessment calibration.

## Data Retention & Erasure
Personal data is retained only for operational necessities or statutory requirements. Live audio streams are deleted or anonymized upon session completion unless saved by the user or opted-in for model training. Account deletion and complete data erasure can be requested at any time by emailing privacy@fluenxiaapp.com.

## Data Principal Rights
Under applicable data protection laws (including the DPDP Act 2023 and GDPR), users hold the right to access, correct, export, or erase their personal data, and withdraw consent at any time via in-app privacy settings or by contacting privacy@fluenxiaapp.com.`,
  updatedAt: new Date(0).toISOString(),
};

export const siteSettingsStore = {
  async get(): Promise<Omit<SiteSettingsDoc, keyof Document>> {
    const doc = await SiteSettingsModel.findOne({ id: SITE_SETTINGS_ID });
    if (!doc) return DEFAULT_SITE_SETTINGS;
    const obj = doc.toObject();
    delete (obj as any)._id;
    return obj;
  },
  async update(patch: Partial<Omit<SiteSettingsDoc, keyof Document>>) {
    const current = await siteSettingsStore.get();
    const next = { ...current, ...patch, id: SITE_SETTINGS_ID, updatedAt: new Date().toISOString() };
    await SiteSettingsModel.findOneAndUpdate({ id: SITE_SETTINGS_ID }, { $set: next }, { upsert: true });
    return next;
  },
};

// ============================================================================
// GUEST VOICE USAGE (short-lived, auto-expires via TTL index) -- meters the Free tier's 3-min/day
// AI voice cap for callers with no account, keyed by IP + calendar date, so "just don't log in"
// isn't a way to bypass the cap enforceVoiceQuota already applies to logged-in accounts.
// ============================================================================

interface GuestVoiceUsageDoc extends Document {
  ip: string;
  date: string; // YYYY-MM-DD
  secondsUsed: number;
  expiresAt: Date;
}

const guestVoiceUsageSchema = new Schema<GuestVoiceUsageDoc>({
  ip: { type: String, required: true },
  date: { type: String, required: true },
  secondsUsed: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});
guestVoiceUsageSchema.index({ ip: 1, date: 1 }, { unique: true });
guestVoiceUsageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const GuestVoiceUsageModel = mongoose.model<GuestVoiceUsageDoc>("GuestVoiceUsage", guestVoiceUsageSchema);

export const guestVoiceUsageStore = {
  // Mirrors checkAndConsumeVoiceQuota's read-check-write shape (server.ts) for the same tolerance
  // to a benign race between two near-simultaneous requests from the same guest -- the existing
  // account-based version has the same minor race, so this isn't held to a stricter standard.
  async checkAndConsume(
    ip: string,
    secondsRequested: number,
    dailyLimitSeconds: number
  ): Promise<{ allowed: boolean; secondsRemainingToday: number }> {
    const today = new Date().toISOString().split("T")[0];
    const existing = await GuestVoiceUsageModel.findOne({ ip, date: today });
    const usedSoFar = existing?.secondsUsed || 0;

    if (usedSoFar >= dailyLimitSeconds) {
      return { allowed: false, secondsRemainingToday: 0 };
    }

    const newUsed = usedSoFar + secondsRequested;
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    await GuestVoiceUsageModel.findOneAndUpdate(
      { ip, date: today },
      { $set: { secondsUsed: newUsed, expiresAt: twoDaysFromNow } },
      { upsert: true }
    );

    return { allowed: true, secondsRemainingToday: Math.max(0, dailyLimitSeconds - newUsed) };
  },
};

// ============================================================================
// OTP CACHE (short-lived, auto-expires via TTL index)
// ============================================================================

interface OtpDoc extends Document {
  target: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

const otpSchema = new Schema<OtpDoc>({
  target: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
});
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = mongoose.model<OtpDoc>("Otp", otpSchema);

// ============================================================================
// PASSWORD RESET TOKENS (short-lived, auto-expires via TTL index)
// ============================================================================

interface PasswordResetDoc extends Document {
  email: string;
  token: string;
  code: string;
  expiresAt: Date;
}

const passwordResetSchema = new Schema<PasswordResetDoc>({
  email: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetModel = mongoose.model<PasswordResetDoc>("PasswordReset", passwordResetSchema);

// ============================================================================
// USER STORE — async data-access layer (replaces the old in-memory Maps)
// ============================================================================

function toPlainUser(doc: UserDoc | null): any | null {
  if (!doc) return null;
  const obj = doc.toObject();
  delete obj._id;
  delete obj.passwordHash;
  return obj;
}

export const userStore = {
  async getById(id: string) {
    return toPlainUser(await UserModel.findOne({ id }));
  },
  async getByEmail(email: string) {
    return toPlainUser(await UserModel.findOne({ email: email.toLowerCase().trim() }));
  },
  async getByGoogleId(googleId: string) {
    return toPlainUser(await UserModel.findOne({ googleId }));
  },
  async getByAppleId(appleId: string) {
    return toPlainUser(await UserModel.findOne({ appleId }));
  },
  async getByPhone(phone: string) {
    return toPlainUser(await UserModel.findOne({ phone }));
  },
  async getAll() {
    const docs = await UserModel.find({});
    return docs.map((d) => toPlainUser(d));
  },
  async has(id: string) {
    return (await UserModel.exists({ id })) !== null;
  },
  async upsert(user: any) {
    await UserModel.findOneAndUpdate({ id: user.id }, { $set: user }, { upsert: true, returnDocument: "after" });
    return toPlainUser(await UserModel.findOne({ id: user.id }));
  },
  async update(id: string, patch: any) {
    await UserModel.findOneAndUpdate({ id }, { $set: patch });
    return toPlainUser(await UserModel.findOne({ id }));
  },
};

export const passwordStore = {
  async set(email: string, plainPassword: string) {
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    await UserModel.findOneAndUpdate({ email: email.toLowerCase().trim() }, { $set: { passwordHash } });
  },
  async verify(email: string, plainPassword: string): Promise<boolean> {
    const doc = await UserModel.findOne({ email: email.toLowerCase().trim() });
    if (!doc || !doc.passwordHash) return false;
    return bcrypt.compare(plainPassword, doc.passwordHash);
  },
  async has(email: string) {
    const doc = await UserModel.findOne({ email: email.toLowerCase().trim() });
    return !!doc?.passwordHash;
  },
};

export const otpStore = {
  async set(target: string, otp: string, expiresAt: number) {
    await OtpModel.findOneAndUpdate(
      { target },
      { $set: { otp, expiresAt: new Date(expiresAt), attempts: 0 } },
      { upsert: true }
    );
  },
  async get(target: string) {
    const doc = await OtpModel.findOne({ target });
    if (!doc) return undefined;
    return { otp: doc.otp, expiresAt: doc.expiresAt.getTime(), attempts: doc.attempts };
  },
  async delete(target: string) {
    await OtpModel.deleteOne({ target });
  },
};

export const passwordResetStore = {
  async set(email: string, data: { token: string; expiresAt: number; code: string }) {
    await PasswordResetModel.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $set: { token: data.token, code: data.code, expiresAt: new Date(data.expiresAt) } },
      { upsert: true }
    );
  },
  async get(email: string) {
    const doc = await PasswordResetModel.findOne({ email: email.toLowerCase().trim() });
    if (!doc) return undefined;
    return { token: doc.token, code: doc.code, expiresAt: doc.expiresAt.getTime() };
  },
  async delete(email: string) {
    await PasswordResetModel.deleteOne({ email: email.toLowerCase().trim() });
  },
};

// ============================================================================
// ACTIVITY LOG (admin "recent activity" feed) — previously an in-memory array capped at 50
// entries and wiped on every server restart/redeploy. Now persisted so history survives restarts.
// ============================================================================

export interface ActivityLogDoc extends Document {
  id: string;
  userId: string;
  userName: string;
  userRole: "student" | "admin" | "owner";
  avatarUrl?: string;
  type: "quiz" | "lesson" | "stress" | "chat" | "vocab" | "login" | "admin_action";
  title: string;
  detail: string;
  score?: number;
  timestamp: number;
}

const activityLogSchema = new Schema<ActivityLogDoc>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String, enum: ["student", "admin", "owner"], required: true },
    avatarUrl: String,
    type: { type: String, enum: ["quiz", "lesson", "stress", "chat", "vocab", "login", "admin_action"], required: true },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    score: Number,
    timestamp: { type: Number, required: true, index: true },
  },
  { versionKey: false }
);

export const ActivityLogModel = mongoose.model<ActivityLogDoc>("ActivityLog", activityLogSchema);

const ACTIVITY_LOG_MAX_ROWS = 2000;

export const activityLogStore = {
  async add(item: Omit<ActivityLogDoc, keyof Document>) {
    await ActivityLogModel.create(item);
    // Bound unbounded growth without limiting the useful history the way the old
    // in-memory 50-item cap did — trim only once we're well past a generous ceiling.
    const count = await ActivityLogModel.countDocuments();
    if (count > ACTIVITY_LOG_MAX_ROWS) {
      const excess = count - ACTIVITY_LOG_MAX_ROWS;
      const oldest = await ActivityLogModel.find({}, { _id: 1 }).sort({ timestamp: 1 }).limit(excess);
      await ActivityLogModel.deleteMany({ _id: { $in: oldest.map((d) => d._id) } });
    }
  },
  async recent(limit = 50) {
    const docs = await ActivityLogModel.find({}).sort({ timestamp: -1 }).limit(limit);
    return docs.map((d) => {
      const obj = d.toObject();
      delete obj._id;
      return obj;
    });
  },
  async all() {
    const docs = await ActivityLogModel.find({}).sort({ timestamp: -1 });
    return docs.map((d) => {
      const obj = d.toObject();
      delete obj._id;
      return obj;
    });
  },
};

// ============================================================================
// AUTH TELEMETRY — previously an in-memory array capped at 100-200 entries, wiped on restart.
// Event shape varies by call site (auth_completed/auth_failed/password_reset_requested/client-
// reported events), so it's stored as a flexible document rather than a rigid schema.
// ============================================================================

interface AuthTelemetryDoc extends Document {
  id: string;
  timestamp: number;
  data: Record<string, any>;
}

const authTelemetrySchema = new Schema<AuthTelemetryDoc>(
  {
    id: { type: String, required: true, unique: true },
    timestamp: { type: Number, required: true, index: true },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { versionKey: false }
);

export const AuthTelemetryModel = mongoose.model<AuthTelemetryDoc>("AuthTelemetry", authTelemetrySchema);

const AUTH_TELEMETRY_MAX_ROWS = 5000;

export const authTelemetryStore = {
  async add(event: Record<string, any>) {
    const id = event.id || `tel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = event.timestamp || Date.now();
    await AuthTelemetryModel.create({ id, timestamp, data: { ...event, id, timestamp } });
    const count = await AuthTelemetryModel.countDocuments();
    if (count > AUTH_TELEMETRY_MAX_ROWS) {
      const excess = count - AUTH_TELEMETRY_MAX_ROWS;
      const oldest = await AuthTelemetryModel.find({}, { _id: 1 }).sort({ timestamp: 1 }).limit(excess);
      await AuthTelemetryModel.deleteMany({ _id: { $in: oldest.map((d) => d._id) } });
    }
  },
  async recent(limit = 25) {
    const docs = await AuthTelemetryModel.find({}).sort({ timestamp: -1 }).limit(limit);
    return docs.map((d) => d.data);
  },
  async all() {
    const docs = await AuthTelemetryModel.find({}).sort({ timestamp: -1 });
    return docs.map((d) => d.data);
  },
  async count(filter: (e: Record<string, any>) => boolean) {
    const all = await authTelemetryStore.all();
    return all.filter(filter).length;
  },
};

// ============================================================================
// ANONYMOUS ATTEMPT TELEMETRY — previously read from / written to a JSON file on the server's
// local disk (anonymous_attempts_telemetry.json), which is lost on Render's ephemeral filesystem
// across redeploys/restarts unless a persistent disk is explicitly attached. Now in MongoDB.
// ============================================================================

export interface AnonymousAttemptDoc extends Document {
  id: string;
  timestamp: string;
  test_type: "spoken_assessment" | "writing_diagnostic" | "grammar_diagnostic" | "integrity_studio_scan" | "fluidconvo_roleplay" | "speech_coaching";
  target_cefr_level?: string;
  achieved_cefr_or_score: string;
  score_numeric: number;
  plagiarism_risk: "LOW" | "MEDIUM" | "HIGH";
  similarity_percentage: number;
  flagged_passages_count: number;
  word_count: number;
  integrity_status: "passed" | "flagged" | "review_needed";
  client_session_hash: string;
}

const anonymousAttemptSchema = new Schema<AnonymousAttemptDoc>(
  {
    id: { type: String, required: true, unique: true },
    timestamp: { type: String, required: true, index: true },
    test_type: {
      type: String,
      enum: ["spoken_assessment", "writing_diagnostic", "grammar_diagnostic", "integrity_studio_scan", "fluidconvo_roleplay", "speech_coaching"],
      required: true,
    },
    target_cefr_level: String,
    achieved_cefr_or_score: { type: String, required: true },
    score_numeric: { type: Number, required: true },
    plagiarism_risk: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    similarity_percentage: { type: Number, required: true },
    flagged_passages_count: { type: Number, required: true },
    word_count: { type: Number, required: true },
    integrity_status: { type: String, enum: ["passed", "flagged", "review_needed"], required: true },
    client_session_hash: { type: String, required: true },
  },
  { versionKey: false }
);

export const AnonymousAttemptModel = mongoose.model<AnonymousAttemptDoc>("AnonymousAttempt", anonymousAttemptSchema);

const ANONYMOUS_ATTEMPT_MAX_ROWS = 5000;

function toPlainAttempt(doc: AnonymousAttemptDoc) {
  const obj = doc.toObject();
  delete obj._id;
  return obj;
}

export const anonymousAttemptStore = {
  async add(entry: Omit<AnonymousAttemptDoc, keyof Document>) {
    await AnonymousAttemptModel.create(entry);
    const count = await AnonymousAttemptModel.countDocuments();
    if (count > ANONYMOUS_ATTEMPT_MAX_ROWS) {
      const excess = count - ANONYMOUS_ATTEMPT_MAX_ROWS;
      const oldest = await AnonymousAttemptModel.find({}, { _id: 1 }).sort({ timestamp: 1 }).limit(excess);
      await AnonymousAttemptModel.deleteMany({ _id: { $in: oldest.map((d) => d._id) } });
    }
  },
  async all() {
    const docs = await AnonymousAttemptModel.find({}).sort({ timestamp: -1 });
    return docs.map(toPlainAttempt);
  },
  async recent(limit = 100) {
    const docs = await AnonymousAttemptModel.find({}).sort({ timestamp: -1 }).limit(limit);
    return docs.map(toPlainAttempt);
  },
  async count() {
    return AnonymousAttemptModel.countDocuments();
  },
  async clearAll() {
    await AnonymousAttemptModel.deleteMany({});
  },
};

export async function seedIfEmpty(seedFn: () => Promise<void> | void) {
  const count = await UserModel.countDocuments();
  if (count === 0) {
    console.log("[db] No users found — seeding initial demo accounts");
    await seedFn();
  } else {
    console.log(`[db] ${count} user(s) already present — skipping seed`);
  }
}
