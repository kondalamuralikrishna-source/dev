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
  type: "quiz" | "lesson" | "stress" | "chat" | "vocab" | "login";
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
    type: { type: String, enum: ["quiz", "lesson", "stress", "chat", "vocab", "login"], required: true },
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
