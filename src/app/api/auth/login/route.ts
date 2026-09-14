import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { users, userRoles, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, SESSION_COOKIE_NAME, SESSION_LIFESPAN_SECONDS } from "@/lib/auth/session";
import { ClinicRole } from "@/lib/auth/permissions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = await getDb();

    // 1. Fetch active user
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, normalizedEmail), eq(users.isActive, true)))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 2. Verify password with timing-safe comparison
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // 3. Resolve user roles
    const assignedRoles = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, user.id));

    const roleList = assignedRoles.map((r: { roleId: string }) => r.roleId as ClinicRole);

    // 4. Capture request context
    const ipAddress = req.headers.get("x-forwarded-for") || req.ip || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 5. Create secure server-managed session
    const rawToken = await createSession(user.id, { ipAddress, userAgent });

    // 6. Record security audit log
    await db.insert(auditLogs).values({
      action: "LOGIN",
      entityType: "SESSION",
      entityId: user.id,
      actorId: user.id,
      actorRole: roleList[0] || "STAFF",
      ipAddress,
      details: { email: user.email, userAgent },
    });

    // 7. Configure secure HTTP-only session cookie
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
    console.error("Auth login error:", error);
    return NextResponse.json(
      { error: "Internal authentication error" },
      { status: 500 }
    );
  }
}
