import { AiService, AiReceptionistMetrics, AiChatMessage } from "../ai.service";
import { mockStore } from "@/lib/mock/store";

export class MockAiService implements AiService {
  async getMetrics(tenantId: string): Promise<AiReceptionistMetrics> {
    const tenant = mockStore.getTenant(tenantId);
    const isAiPlan = tenant?.planId === "practiceos_ai";

    if (!isAiPlan) {
      return {
        status: "UPGRADE_REQUIRED",
        conversationsToday: 0,
        resolvedAutomatically: 0,
        humanHandoffs: 0,
        bookingsAssisted: 0,
        avgResponseSeconds: 0,
      };
    }

    return {
      status: "ONLINE",
      conversationsToday: 34,
      resolvedAutomatically: 28,
      humanHandoffs: 3,
      bookingsAssisted: 9,
      avgResponseSeconds: 2.1,
    };
  }

  async simulateChat(tenantId: string, message: string): Promise<AiChatMessage> {
    const tenant = mockStore.getTenant(tenantId) || mockStore.getActiveTenant();
    const query = message.toLowerCase();
    const aiName = tenant.settings.aiName || "Maya";

    // Medical safety guardrails
    if (query.includes("prescribe") || query.includes("medication") || query.includes("tablet") || query.includes("pills")) {
      return {
        role: "assistant",
        content: `I am ${aiName}, the practice assistant at ${tenant.name}. As a practice receptionist, I cannot provide medication advice or prescriptions. Our licensed therapists conduct psychotherapy; if medication is needed, we coordinate referrals with affiliated medical psychiatrists. Would you like to schedule an intake assessment?`,
        timestamp: new Date().toISOString(),
        isSimulated: true,
      };
    }

    if (query.includes("emergency") || query.includes("suicide") || query.includes("harm") || query.includes("crisis")) {
      return {
        role: "assistant",
        content: `[URGENT / CRISIS ESCALATION] If you or someone you know is in acute danger or experiencing a crisis, please immediately reach out to the National Tele-MANAS helpline at 14416 or call local emergency services (112). Our clinic is not an emergency psychiatric hospital. We are notifying our duty clinician immediately.`,
        timestamp: new Date().toISOString(),
        isSimulated: true,
      };
    }

    if (query.includes("time") || query.includes("open") || query.includes("hours") || query.includes("tomorrow")) {
      return {
        role: "assistant",
        content: `Hello! ${tenant.name} is open Monday to Saturday from 9:00 AM to 7:30 PM. We are closed on Sundays. Would you like me to find an available consultation slot for you tomorrow?`,
        timestamp: new Date().toISOString(),
        isSimulated: true,
      };
    }

    if (query.includes("fee") || query.includes("cost") || query.includes("price") || query.includes("charge")) {
      const srvList = tenant.services
        .slice(0, 3)
        .map((s) => `• ${s.name}: ₹${s.price.toLocaleString("en-IN")}`)
        .join("\n");
      return {
        role: "assistant",
        content: `Here are our standard consultation fees at ${tenant.name}:\n\n${srvList}\n\nAll sessions include comprehensive clinical documentation. Would you like to book one of these options?`,
        timestamp: new Date().toISOString(),
        isSimulated: true,
      };
    }

    if (query.includes("where") || query.includes("location") || query.includes("address") || query.includes("map")) {
      return {
        role: "assistant",
        content: `${tenant.name} is conveniently located at: ${tenant.address}. Basement visitor parking is available on-site. Can I help you with driving directions or booking a session?`,
        timestamp: new Date().toISOString(),
        isSimulated: true,
      };
    }

    if (query.includes("book") || query.includes("appointment") || query.includes("slot") || query.includes("schedule")) {
      return {
        role: "assistant",
        content: `I would be happy to help you schedule an appointment at ${tenant.name}. We have slots available with our practitioners tomorrow afternoon at 2:00 PM and 4:30 PM. Would you prefer an in-person session at our clinic, or a secure online telehealth consultation?`,
        timestamp: new Date().toISOString(),
        isSimulated: true,
      };
    }

    // Default friendly assistant response
    return {
      role: "assistant",
      content: `Hello! I am ${aiName}, the practice assistant at ${tenant.name}. I can help you check consultation fees, practitioner availability, clinic directions, or book a new session. How can I assist you today?`,
      timestamp: new Date().toISOString(),
      isSimulated: true,
    };
  }
}

export const mockAiService = new MockAiService();
