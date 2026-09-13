import { WebsiteConfig } from "@/types";

export interface WebsiteService {
  getConfig(tenantId: string): Promise<WebsiteConfig>;
  updateConfig(tenantId: string, updates: Partial<WebsiteConfig>): Promise<WebsiteConfig>;
}
