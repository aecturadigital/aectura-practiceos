import { Message, Conversation } from "@/types";

export interface MessagingService {
  getConversations(tenantId?: string): Promise<Conversation[]>;
  getMessages(tenantId?: string, contactId?: string): Promise<Message[]>;
  sendMessage(msg: Omit<Message, "id" | "timestamp" | "status">): Promise<Message>;
  toggleAi(conversationId: string, enabled: boolean): Promise<void>;
}
