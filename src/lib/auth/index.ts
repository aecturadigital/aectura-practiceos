export * from "./password";
export * from "./permissions";
export * from "./session";

import { AuthenticatedUser } from "./session";
import { ClinicRole, PERMISSIONS } from "./permissions";

// Backward-compatible type aliases
export type Role = ClinicRole;
export type SessionUser = AuthenticatedUser;

/**
 * Fallback resolver for testing context
 */
export function resolveSession(headersOrCookies?: any): {
  id: string;
  name: string;
  email: string;
  roles: ClinicRole[];
  role: ClinicRole;
  isSuperAdmin: boolean;
} {
  const userId = headersOrCookies?.get?.("x-user-id") || "owner-soulmates";
  const userRole = (headersOrCookies?.get?.("x-user-role") as ClinicRole) || "OWNER";

  return {
    id: userId,
    name: userRole === "OWNER" ? "Col Umakant Saxena" : "Staff Member",
    email: userRole === "OWNER" ? "owner@soulmatestherapy.com" : "staff@soulmatestherapy.com",
    roles: [userRole],
    role: userRole,
    isSuperAdmin: userRole === "OWNER",
  };
}
