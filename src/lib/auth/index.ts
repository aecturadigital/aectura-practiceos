export type Role = 
  | "super_admin" 
  | "tenant_owner" 
  | "tenant_admin" 
  | "practitioner" 
  | "receptionist" 
  | "patient";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  tenantId?: string;
  role?: Role;
}

export const PERMISSIONS = {
  "admin:manage_practices": ["super_admin"],
  "tenant:settings": ["super_admin", "tenant_owner", "tenant_admin"],
  "contacts:read": ["super_admin", "tenant_owner", "tenant_admin", "practitioner", "receptionist"],
  "contacts:write": ["super_admin", "tenant_owner", "tenant_admin", "practitioner", "receptionist"],
  "appointments:read": ["super_admin", "tenant_owner", "tenant_admin", "practitioner", "receptionist"],
  "appointments:write": ["super_admin", "tenant_owner", "tenant_admin", "practitioner", "receptionist"],
} as const;

export function hasPermission(role: Role, action: keyof typeof PERMISSIONS): boolean {
  return PERMISSIONS[action]?.includes(role as any) ?? false;
}

// Development / Request Context Session Resolver
export function resolveSession(headersOrCookies?: any): SessionUser {
  // Check for simulated test headers
  const userId = headersOrCookies?.get?.("x-user-id") || "super-admin-01";
  const userRole = (headersOrCookies?.get?.("x-user-role") as Role) || "super_admin";
  const tenantId = headersOrCookies?.get?.("x-tenant-id") || undefined;
  const isSuperAdmin = userRole === "super_admin";

  return {
    id: userId,
    name: isSuperAdmin ? "Aectura Super Admin" : "Practice Staff Member",
    email: isSuperAdmin ? "admin@aectura.com" : "staff@clinic.practiceos.com",
    isSuperAdmin,
    tenantId,
    role: userRole,
  };
}
