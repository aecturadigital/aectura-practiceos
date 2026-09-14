export type ClinicRole =
  | "OWNER"
  | "CLINIC_ADMIN"
  | "PRACTITIONER"
  | "RECEPTIONIST"
  | "BILLING_ACCOUNTANT"
  | "PATIENT";

export const PERMISSIONS = {
  // Appointments & Calendar
  "appointments:read": ["OWNER", "CLINIC_ADMIN", "PRACTITIONER", "RECEPTIONIST"],
  "appointments:write": ["OWNER", "CLINIC_ADMIN", "PRACTITIONER", "RECEPTIONIST"],

  // Clinical Notes & EMR (Strictly Restricted)
  "clinical_notes:read": ["OWNER", "PRACTITIONER"],
  "clinical_notes:write": ["OWNER", "PRACTITIONER"],

  // Treatment Courses & Cycles
  "treatment_plans:read": ["OWNER", "CLINIC_ADMIN", "PRACTITIONER", "RECEPTIONIST", "BILLING_ACCOUNTANT"],
  "treatment_plans:write": ["OWNER", "CLINIC_ADMIN", "PRACTITIONER"],
  "treatment_plans:deduct": ["OWNER", "CLINIC_ADMIN", "PRACTITIONER"],

  // Finance & Ledger
  "ledger:read": ["OWNER", "CLINIC_ADMIN", "BILLING_ACCOUNTANT", "RECEPTIONIST"],
  "ledger:write": ["OWNER", "CLINIC_ADMIN", "BILLING_ACCOUNTANT", "RECEPTIONIST"],

  // Staff Operations & Payroll
  "staffops:read": ["OWNER", "CLINIC_ADMIN", "BILLING_ACCOUNTANT"],
  "staffops:write": ["OWNER", "CLINIC_ADMIN"],
  "payroll:manage": ["OWNER", "BILLING_ACCOUNTANT"],

  // Clinic Settings
  "settings:manage": ["OWNER", "CLINIC_ADMIN"],

  // Patient Self-Service
  "portal:access": ["PATIENT"],
} as const;

export type PermissionAction = keyof typeof PERMISSIONS;

/**
 * Checks whether any of the user's roles matches the target role.
 */
export function hasRole(userRoles: string[], targetRole: ClinicRole): boolean {
  return userRoles.includes(targetRole);
}

/**
 * Checks whether any of the user's assigned roles satisfies the requested action permission.
 */
export function hasPermission(userRoles: string[], action: PermissionAction): boolean {
  const allowedRoles = PERMISSIONS[action] as readonly string[];
  if (!allowedRoles) return false;
  return userRoles.some((r) => allowedRoles.includes(r));
}

/**
 * Asserts permission, throwing an Error if unauthorized.
 */
export function assertPermission(userRoles: string[], action: PermissionAction): void {
  if (!hasPermission(userRoles, action)) {
    throw new Error(`Unauthorized: User lacks required permission '${action}'`);
  }
}
