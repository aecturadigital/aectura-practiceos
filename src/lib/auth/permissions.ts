import { getDb } from "@/lib/db";
import { rolePermissions, userPermissionOverrides, userRoles, patientAccounts } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

export type ClinicRole =
  | "OWNER"
  | "CLINIC_ADMIN"
  | "PRACTITIONER"
  | "RECEPTIONIST"
  | "BILLING_ACCOUNTANT"
  | "HR_MANAGER"
  | "PATIENT"
  | "READ_ONLY_AUDITOR";

export const CANONICAL_PERMISSIONS = [
  // Contacts / CRM
  "contacts.read",
  "contacts.create",
  "contacts.update",
  "contacts.archive",

  // Scheduling
  "appointments.read",
  "appointments.create",
  "appointments.reschedule",
  "appointments.cancel",

  // Clinical Notes & EMR (Strictly Restricted)
  "clinical_notes.read",
  "clinical_notes.create",
  "clinical_notes.update",

  // Treatment Plans & Entitlements
  "treatment_plans.read",
  "treatment_plans.modify",

  // Finance & Ledger
  "billing.read",
  "payments.record",
  "refunds.approve",

  // Documents
  "documents.read",
  "documents.upload",

  // StaffOps
  "staff.read",
  "staff.manage",

  // Payroll
  "payroll.read",
  "payroll.manage",

  // Compliance & Exports
  "exports.patient",
  "exports.financial",

  // Clinic Settings
  "settings.manage",

  // Patient Self-Service
  "portal.access",
] as const;

export type CanonicalPermission = typeof CANONICAL_PERMISSIONS[number];

/**
 * Default role-to-permission mappings (System Baseline).
 * Used when database role_permissions have not yet been customized per clinic.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<ClinicRole, readonly CanonicalPermission[]> = {
  OWNER: CANONICAL_PERMISSIONS, // Complete full authority

  CLINIC_ADMIN: [
    "contacts.read",
    "contacts.create",
    "contacts.update",
    "contacts.archive",
    "appointments.read",
    "appointments.create",
    "appointments.reschedule",
    "appointments.cancel",
    "treatment_plans.read",
    "treatment_plans.modify",
    "billing.read",
    "payments.record",
    "refunds.approve",
    "documents.read",
    "documents.upload",
    "staff.read",
    "staff.manage",
    "payroll.read",
    "exports.financial",
    "settings.manage",
  ],

  PRACTITIONER: [
    "contacts.read",
    "contacts.create",
    "contacts.update",
    "appointments.read",
    "appointments.create",
    "appointments.reschedule",
    "appointments.cancel",
    "clinical_notes.read",
    "clinical_notes.create",
    "clinical_notes.update",
    "treatment_plans.read",
    "treatment_plans.modify",
    "documents.read",
    "documents.upload",
  ],

  RECEPTIONIST: [
    "contacts.read",
    "contacts.create",
    "contacts.update",
    "contacts.archive",
    "appointments.read",
    "appointments.create",
    "appointments.reschedule",
    "appointments.cancel",
    "treatment_plans.read",
    "billing.read",
    "payments.record",
    "documents.read",
    "documents.upload",
    // Strictly NO clinical_notes.*, NO staff.manage, NO payroll.*
  ],

  BILLING_ACCOUNTANT: [
    "contacts.read",
    "billing.read",
    "payments.record",
    "refunds.approve",
    "payroll.read",
    "payroll.manage",
    "exports.financial",
    // Strictly NO clinical_notes.*, NO appointments mutation
  ],

  HR_MANAGER: [
    "staff.read",
    "staff.manage",
    "payroll.read",
    "payroll.manage",
    // Strictly NO patient contacts, NO appointments, NO clinical_notes
  ],

  READ_ONLY_AUDITOR: [
    "contacts.read",
    "appointments.read",
    "clinical_notes.read",
    "treatment_plans.read",
    "billing.read",
    "documents.read",
    "staff.read",
    "payroll.read",
    "exports.financial",
    // Zero mutation privileges!
  ],

  PATIENT: [
    "portal.access",
  ],
};

// Backward-compatibility map for Phase 2 code
export const PERMISSIONS = {
  "appointments:read": ["OWNER", "CLINIC_ADMIN", "PRACTITIONER", "RECEPTIONIST", "READ_ONLY_AUDITOR"],
  "appointments:write": ["OWNER", "CLINIC_ADMIN", "PRACTITIONER", "RECEPTIONIST"],
  "clinical_notes:read": ["OWNER", "PRACTITIONER", "READ_ONLY_AUDITOR"],
  "clinical_notes:write": ["OWNER", "PRACTITIONER"],
  "treatment_plans:read": ["OWNER", "CLINIC_ADMIN", "PRACTITIONER", "RECEPTIONIST", "BILLING_ACCOUNTANT", "READ_ONLY_AUDITOR"],
  "treatment_plans:write": ["OWNER", "CLINIC_ADMIN", "PRACTITIONER"],
  "treatment_plans:deduct": ["OWNER", "CLINIC_ADMIN", "PRACTITIONER"],
  "ledger:read": ["OWNER", "CLINIC_ADMIN", "BILLING_ACCOUNTANT", "RECEPTIONIST", "READ_ONLY_AUDITOR"],
  "ledger:write": ["OWNER", "CLINIC_ADMIN", "BILLING_ACCOUNTANT", "RECEPTIONIST"],
  "staffops:read": ["OWNER", "CLINIC_ADMIN", "BILLING_ACCOUNTANT", "HR_MANAGER", "READ_ONLY_AUDITOR"],
  "staffops:write": ["OWNER", "CLINIC_ADMIN", "HR_MANAGER"],
  "payroll:manage": ["OWNER", "BILLING_ACCOUNTANT", "HR_MANAGER"],
  "settings:manage": ["OWNER", "CLINIC_ADMIN"],
  "portal:access": ["PATIENT"],
} as const;

export type PermissionAction = keyof typeof PERMISSIONS;

export function hasRole(userRolesList: string[], targetRole: ClinicRole): boolean {
  return userRolesList.includes(targetRole);
}

export function hasPermission(userRolesList: string[], action: PermissionAction): boolean {
  const allowedRoles = PERMISSIONS[action] as readonly string[];
  if (!allowedRoles) return false;
  return userRolesList.some((r) => allowedRoles.includes(r));
}

export function assertPermission(userRolesList: string[], action: PermissionAction): void {
  if (!hasPermission(userRolesList, action)) {
    throw new Error(`Unauthorized: User lacks required permission '${action}'`);
  }
}

/**
 * Calculates Effective Permissions using the mandatory algorithm:
 * ROLE DEFAULTS (Union of assigned roles)
 * + USER ALLOW OVERRIDES (Explicit user-level additions)
 * - USER DENY OVERRIDES (Explicit user-level restrictions; DENY wins)
 * = EFFECTIVE PERMISSIONS
 */
export async function getEffectivePermissions(userId: string, dbParam?: any): Promise<Set<string>> {
  const db = dbParam || (await getDb());

  // 1. Fetch user roles
  const userRoleRows = await db
    .select({ roleId: userRoles.roleId })
    .from(userRoles)
    .where(eq(userRoles.userId, userId));

  const assignedRoleIds = userRoleRows.map((r: { roleId: string }) => r.roleId as ClinicRole);
  const effective = new Set<string>();

  // 2. Base permissions from database role_permissions or fallback defaults
  if (assignedRoleIds.length > 0) {
    const dbRolePerms = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(inArray(rolePermissions.roleId, assignedRoleIds));

    if (dbRolePerms.length > 0) {
      for (const p of dbRolePerms) {
        effective.add(p.permissionId);
      }
    } else {
      // Use standard baseline defaults
      for (const roleId of assignedRoleIds) {
        const defaultList = DEFAULT_ROLE_PERMISSIONS[roleId as ClinicRole] || [];
        for (const perm of defaultList) {
          effective.add(perm);
        }
      }
    }
  }

  // 3. Apply User-Level Overrides
  const overrides = await db
    .select({
      permissionId: userPermissionOverrides.permissionId,
      effect: userPermissionOverrides.effect,
    })
    .from(userPermissionOverrides)
    .where(eq(userPermissionOverrides.userId, userId));

  for (const o of overrides) {
    if (o.effect === "ALLOW") {
      effective.add(o.permissionId);
    } else if (o.effect === "DENY") {
      // Explicit DENY wins
      effective.delete(o.permissionId);
    }
  }

  return effective;
}

/**
 * Server-side authorization check enforcing effective permissions, patient account isolation,
 * and restricted clinical profile rules.
 */
export async function authorizeRequest(
  userId: string,
  requiredPermission: CanonicalPermission,
  options?: {
    contactId?: string;
    isRestrictedProfile?: boolean;
    isPatientContext?: boolean;
  },
  dbParam?: any
): Promise<void> {
  const db = dbParam || (await getDb());

  // 1. Check Patient Account Identity Boundary (Condition 2)
  if (options?.isPatientContext) {
    if (!options.contactId) {
      throw new Error("Patient access violation: contactId required for patient verification");
    }

    const [account] = await db
      .select()
      .from(patientAccounts)
      .where(eq(patientAccounts.userId, userId))
      .limit(1);

    if (!account || !account.portalAccessEnabled) {
      throw new Error("Forbidden: Patient portal access is disabled or unlinked");
    }

    if (account.contactId !== options.contactId) {
      throw new Error("Security Violation: Patient account cannot access another patient's data");
    }
    return;
  }

  // 2. Compute Effective Permissions
  const effectivePerms = await getEffectivePermissions(userId);

  if (!effectivePerms.has(requiredPermission)) {
    throw new Error(`Forbidden: User lacks effective permission '${requiredPermission}'`);
  }

  // 3. Check Restricted Clinical Profile
  if (options?.isRestrictedProfile) {
    // Only OWNER and assigned practitioners may view restricted clinical profiles
    const userRoleRows = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    const isOwner = userRoleRows.some((r: { roleId: string }) => r.roleId === "OWNER");
    const isPractitioner = userRoleRows.some((r: { roleId: string }) => r.roleId === "PRACTITIONER");

    if (!isOwner && !isPractitioner) {
      throw new Error("Forbidden: Profile is restricted to clinic owner and clinical practitioners");
    }
  }
}
