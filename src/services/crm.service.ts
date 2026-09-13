import { CrmDeal, CrmStage } from "@/types";

export interface CrmService {
  list(tenantId?: string): Promise<CrmDeal[]>;
  updateStage(dealId: string, stage: CrmStage): Promise<void>;
  create(deal: CrmDeal): Promise<CrmDeal>;
}
