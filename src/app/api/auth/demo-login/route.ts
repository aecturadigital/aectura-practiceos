import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, userRoles, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createSession, SESSION_COOKIE_NAME, SESSION_LIFESPAN_SECONDS } from "@/lib/auth/session";
import { ClinicRole } from "@/lib/auth/permissions";

const ALLOWED_DEMO_EMAILS = new Set([
  "owner@soulmatestherapy.com",
  "staff@soulmatestherapy.com",
  "hr@soulmatestherapy.com",
  "auditor@soulmatestherapy.com",
]);

export async function POST(req: NextRequest) {
  try {
    // Strict Environment Guard: Demo login is disabled unless explicitly activated
    const isDemoEnabled =
      process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true" ||
      process.env.ENABLE_DEMO_LOGIN === "true";

    if (!isDemoEnabled) {
      return NextResponse.json(
        { error: "Demo authentication is strictly disabled in production environments." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Demo user email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!ALLOWED_DEMO_EMAILS.has(normalizedEmail)) {
      return NextResponse.json(
        { error: "Requested user is not an authorized demo profile." },
        { status: 403 }
      );
    }

    const db = await getDb();

    // Verify user exists and is active
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, normalizedEmail), eq(users.isActive, true)))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Demo profile user not found or inactive." },
        { status: 404 }
      );
    }

    // Resolve user roles
    const assignedRoles = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const roleList = assignedRoles.map((r: { roleId: string }) => r.roleId as ClinicRole);

    const ipAddress = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create session
    const rawToken = await createSession(user.id, { ipAddress, userAgent });

    // Audit log
    await db.insert(auditLogs).values({
      action: "DEMO_LOGIN",
      entityType: "SESSION",
      entityId: user.id,
      actorId: user.id,
      actorRole: roleList[0] || "STAFF",
      ipAddress,
      details: { email: user.email, userAgent, demoMode: true },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: roleList,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: rawToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_LIFESPAN_SECONDS,
    });

    return response;
  } catch (error: any) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Internal demo authentication error" },
      { status: 500 }
    );
  }
}
