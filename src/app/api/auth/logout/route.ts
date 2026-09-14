import { NextRequest, NextResponse } from "next/server";
import { revokeSession, SESSION_COOKIE_NAME, validateSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
    if (sessionCookie?.value) {
      const user = await validateSession(sessionCookie.value);
      await revokeSession(sessionCookie.value);

      if (user) {
        const db = await getDb();
        await db.insert(auditLogs).values({
          action: "LOGOUT",
          entityType: "SESSION",
          entityId: user.sessionId,
          actorId: user.id,
          actorRole: user.roles[0] || "STAFF",
          details: { email: user.email },
        });
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error: any) {
    console.error("Auth logout error:", error);
    const response = NextResponse.json({ success: true });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}
