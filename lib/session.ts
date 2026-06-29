import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ivmm_user_id";

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET não configurado no ambiente de produção.");
  }
  return "ivmm-local-development-session-secret";
}

function signature(userId: string) {
  return createHmac("sha256", sessionSecret()).update(userId).digest("hex");
}

export function createSessionToken(userId: string) {
  return `${userId}.${signature(userId)}`;
}

export function readSessionToken(token?: string) {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator < 1) return process.env.NODE_ENV === "production" ? null : token;

  const userId = token.slice(0, separator);
  const encodedSignature = token.slice(separator + 1);
  if (!/^[a-f0-9]{64}$/.test(encodedSignature)) return null;
  const supplied = Buffer.from(encodedSignature, "hex");
  const expected = Buffer.from(signature(userId), "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  return userId;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 12,
};
