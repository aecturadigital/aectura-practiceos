import { Message, Conversation } from "@/types";
import { MessagingService } from "../messaging.service";
import { mockStore } from "@/lib/mock/store";

export class MockMessagingService implements MessagingService {
  async getConversations(tenantId?: string): Promise<Conversation[]> {
    return mockStore.getConversations(tenantId);
  }

  async getMessages(tenantId?: string, contactId?: string): Promise<Message[]> {
    return mockStore.getMessages(tenantId, contactId);
  }

  async sendMessage(msg: Omit<Message, "id" | "timestamp" | "status">): Promise<Message> {
    return mockStore.sendMessage(msg);
  }

  async toggleAi(conversationId: string, enabled: boolean): Promise<void> {
    mockStore.toggleConversationAi(conversationId, enabled);
  }
}

export const mockMessagingService = new MockMessagingService();
