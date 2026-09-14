import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { users, sessions, userRoles } from "@/lib/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { ClinicRole } from "./permissions";

export const SESSION_COOKIE_NAME = "practiceos_session";
export const SESSION_LIFESPAN_SECONDS = 12 * 60 * 60; // 12 hours

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  roles: ClinicRole[];
  sessionId: string;
}

/**
 * Derives a SHA-256 hash of the raw session token for safe storage in the database.
 */
export function hashSessionToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Creates a new server-side session in PostgreSQL with a 12-hour expiration window.
 * Returns the raw cryptographically secure token to be set in the HTTP-only cookie.
 */
export async function createSession(
  userId: string,
  reqContext?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  const db = await getDb();
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_LIFESPAN_SECONDS * 1000);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    ipAddress: reqContext?.ipAddress || null,
    userAgent: reqContext?.userAgent || null,
    expiresAt,
  });

  return rawToken;
}

/**
 * Validates a raw session token against the PostgreSQL database.
 * Checks for token validity, non-revocation, expiration, and active user status.
 */
export async function validateSession(rawToken: string): Promise<AuthenticatedUser | null> {
  if (!rawToken || typeof rawToken !== "string") {
    return null;
  }

  const db = await getDb();
  const tokenHash = hashSessionToken(rawToken);

  const [activeSession] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date()),
        isNull(sessions.revokedAt)
      )
    )
    .limit(1);

  if (!activeSession) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, activeSession.userId), eq(users.isActive, true)))
    .limit(1);

  if (!user) {
    return null;
  }

  const assignedRoles = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(eq(userRoles.userId, user.id));

  const roleList = assignedRoles.map((r: { roleId: string }) => r.roleId as ClinicRole);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: roleList,
    sessionId: activeSession.id,
  };
}

/**
 * Revokes an active session by stamping revoked_at in PostgreSQL.
 */
export async function revokeSession(rawToken: string): Promise<boolean> {
  if (!rawToken) return false;
  const db = await getDb();
  const tokenHash = hashSessionToken(rawToken);

  const result = await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(eq(sessions.tokenHash, tokenHash));

  return true;
}

/**
 * Resolves the authenticated user from the current request cookies in Next.js Server Components,
 * Server Actions, and Route Handlers.
 */
export async function getCurrentSession(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
      return null;
    }
    return await validateSession(sessionCookie.value);
  } catch {
    return null;
  }
}
