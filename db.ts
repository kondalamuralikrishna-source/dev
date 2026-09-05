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
  },
  { versionKey: false }
);

export const UserModel = mongoose.model<UserDoc>("User", userSchema);

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

export async function seedIfEmpty(seedFn: () => Promise<void> | void) {
  const count = await UserModel.countDocuments();
  if (count === 0) {
    console.log("[db] No users found — seeding initial demo accounts");
    await seedFn();
  } else {
    console.log(`[db] ${count} user(s) already present — skipping seed`);
  }
}
