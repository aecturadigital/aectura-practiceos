export interface AiReceptionistMetrics {
  status: "ONLINE" | "PAUSED" | "UPGRADE_REQUIRED";
  conversationsToday: number;
  resolvedAutomatically: number;
  humanHandoffs: number;
  bookingsAssisted: number;
  avgResponseSeconds: number;
}

export interface AiChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isSimulated?: boolean;
}

export interface AiService {
  getMetrics(tenantId: string): Promise<AiReceptionistMetrics>;
  simulateChat(tenantId: string, message: string): Promise<AiChatMessage>;
}
