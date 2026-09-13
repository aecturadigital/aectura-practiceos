import { Tenant, PlanId } from "@/types";
import { TenantService } from "../tenant.service";
import { mockStore } from "@/lib/mock/store";

export class MockTenantService implements TenantService {
  async getTenants(): Promise<Tenant[]> {
    return mockStore.getTenants();
  }

  async getTenant(idOrSlug: string): Promise<Tenant | undefined> {
    return mockStore.getTenant(idOrSlug);
  }

  async getActiveTenant(): Promise<Tenant> {
    return mockStore.getActiveTenant();
  }

  async setActiveTenant(idOrSlug: string): Promise<void> {
    mockStore.setActiveTenant(idOrSlug);
  }

  async createTenant(tenant: Tenant): Promise<Tenant> {
    return mockStore.createTenant(tenant);
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined> {
    return mockStore.updateTenant(id, updates);
  }

  async updatePlan(tenantId: string, planId: PlanId): Promise<void> {
    mockStore.updateTenantPlan(tenantId, planId);
  }
}

export const mockTenantService = new MockTenantService();
