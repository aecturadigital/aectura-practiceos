import { WebsiteConfig } from "@/types";
import { WebsiteService } from "../website.service";
import { mockStore } from "@/lib/mock/store";

export class MockWebsiteService implements WebsiteService {
  async getConfig(tenantId: string): Promise<WebsiteConfig> {
    return mockStore.getWebsiteConfig(tenantId);
  }

  async updateConfig(tenantId: string, updates: Partial<WebsiteConfig>): Promise<WebsiteConfig> {
    mockStore.updateWebsiteConfig(tenantId, updates);
    return mockStore.getWebsiteConfig(tenantId);
  }
}

export const mockWebsiteService = new MockWebsiteService();
