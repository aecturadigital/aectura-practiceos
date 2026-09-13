import { Tenant, PlanId } from "@/types";

export interface TenantService {
  getTenants(): Promise<Tenant[]>;
  getTenant(idOrSlug: string): Promise<Tenant | undefined>;
  getActiveTenant(): Promise<Tenant>;
  setActiveTenant(idOrSlug: string): Promise<void>;
  createTenant(tenant: Tenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined>;
  updatePlan(tenantId: string, planId: PlanId): Promise<void>;
}
