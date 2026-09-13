import { CrmDeal, CrmStage } from "@/types";
import { CrmService } from "../crm.service";
import { mockStore } from "@/lib/mock/store";

export class MockCrmService implements CrmService {
  async list(tenantId?: string): Promise<CrmDeal[]> {
    return mockStore.getCrmDeals(tenantId);
  }

  async updateStage(dealId: string, stage: CrmStage): Promise<void> {
    mockStore.updateDealStage(dealId, stage);
  }

  async create(deal: CrmDeal): Promise<CrmDeal> {
    return mockStore.createCrmDeal(deal);
  }
}

export const mockCrmService = new MockCrmService();
