import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { PERMISSIONS, hasPermission, PermissionAction, getEffectivePermissions } from "@/lib/auth/permissions";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permittedActions = Object.keys(PERMISSIONS).filter((action) =>
      hasPermission(user.roles, action as PermissionAction)
    );

    const effectivePermsSet = await getEffectivePermissions(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
      permissions: permittedActions,
      effectivePermissions: Array.from(effectivePermsSet),
    });
  } catch (error: any) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Failed to resolve session context" },
      { status: 500 }
    );
  }
}
