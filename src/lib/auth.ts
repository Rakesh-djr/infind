import crypto from "crypto";
import { cookies } from "next/headers";
import { hash, verify } from "@node-rs/argon2";
import prisma from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "infind_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

/**
 * Hash a plain password using Argon2id with OWASP-recommended parameters.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return hash(plainText, {
    memoryCost: 19456, // 19 MiB
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

/**
 * Safely verify password against an Argon2id hash.
 */
export async function verifyPassword(plainText: string, passwordHash: string): Promise<boolean> {
  try {
    return await verify(passwordHash, plainText);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure random session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash session token using SHA-256 for database storage.
 * The plain token is sent only in the HTTP-only cookie.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Create a new database session and set HTTP-only cookie.
 */
export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const hashedToken = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.create({
    data: {
      userId,
      hashedToken,
      expiresAt,
    },
  });

  const cookieStore = cookies();
  const isSecure = process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return { token, expiresAt };
}

/**
 * Validate active session from incoming cookies and return user.
 */
export async function getSessionUser() {
  const cookieStore = cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  return validateTokenAndGetUser(rawToken);
}

/**
 * Validates a session token string (from cookie or WebSocket handshake) and returns User.
 */
export async function validateTokenAndGetUser(rawToken: string) {
  if (!rawToken || typeof rawToken !== "string" || rawToken.length < 32) {
    return null;
  }

  const hashedToken = hashSessionToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { hashedToken },
    include: {
      user: {
        include: {
          preference: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check revocation or expiration
  if (session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  // Check if user account is banned
  if (session.user.status === "BANNED") {
    return null;
  }

  // Check if suspended
  if (session.user.status === "SUSPENDED" && session.user.suspendedUntil) {
    if (session.user.suspendedUntil > new Date()) {
      return null;
    }
  }

  return session.user;
}

/**
 * Invalidate current session (logout).
 */
export async function revokeCurrentSession(): Promise<void> {
  const cookieStore = cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    const hashedToken = hashSessionToken(rawToken);
    await prisma.session.updateMany({
      where: { hashedToken },
      data: { revokedAt: new Date() },
    }).catch(() => {});
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}
