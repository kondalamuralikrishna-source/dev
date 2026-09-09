import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const TOKEN_TTL = "7d";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Add a long, random JWT_SECRET value to your .env before starting the server."
    );
  }
  return secret;
}

export interface AuthTokenPayload {
  id: string;
  email?: string;
  role: "student" | "admin" | "owner";
}

export function signAuthToken(user: { id: string; email?: string; role: string }): string {
  const payload: AuthTokenPayload = { id: user.id, email: user.email, role: user.role as AuthTokenPayload["role"] };
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_TTL });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, getSecret()) as AuthTokenPayload;
  } catch {
    return null;
  }
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthTokenPayload;
    }
  }
}

export function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice("Bearer ".length).trim();
  }
  return null;
}

// Verifies the bearer token and attaches req.authUser. Rejects with 401 if missing/invalid.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please sign in again." });
  }
  const payload = verifyAuthToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Session expired or invalid. Please sign in again." });
  }
  req.authUser = payload;
  next();
}

// Gates every credential-less "sign in as any email" shortcut (direct Google/Apple/admin-passcode/student
// sign-in, OTP master codes, password master codes). Defaults to OFF so a production deploy can't be
// impersonated; set ALLOW_DEV_AUTH=true locally while developing if you need these shortcuts.
export function isDevAuthAllowed(): boolean {
  return process.env.ALLOW_DEV_AUTH === "true";
}

// Must run after requireAuth. Rejects with 403 if the authenticated user's role isn't allowed.
export function requireRole(...roles: Array<"student" | "admin" | "owner">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.authUser || !roles.includes(req.authUser.role)) {
      return res.status(403).json({ error: "You do not have permission to access this resource." });
    }
    next();
  };
}
