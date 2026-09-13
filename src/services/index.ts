import { mockTenantService } from "./mock/mock-tenant.service";
import { mockContactService } from "./mock/mock-contact.service";
import { mockAppointmentService } from "./mock/mock-appointment.service";
import { mockCrmService } from "./mock/mock-crm.service";
import { mockMessagingService } from "./mock/mock-messaging.service";
import { mockFormService } from "./mock/mock-form.service";
import { mockWebsiteService } from "./mock/mock-website.service";
import { mockAiService } from "./mock/mock-ai.service";
import { mockAnalyticsService } from "./mock/mock-analytics.service";

// Export service singletons for application-wide consumption.
// When production backend services (PostgreSQL, n8n, Cloudflare R2, WhatsApp Cloud API)
// are introduced, replace these mock instances with Api* implementations without altering UI components.
export const tenantService = mockTenantService;
export const contactService = mockContactService;
export const appointmentService = mockAppointmentService;
export const crmService = mockCrmService;
export const messagingService = mockMessagingService;
export const formService = mockFormService;
export const websiteService = mockWebsiteService;
export const aiService = mockAiService;
export const analyticsService = mockAnalyticsService;

export * from "./tenant.service";
export * from "./contact.service";
export * from "./appointment.service";
export * from "./crm.service";
export * from "./messaging.service";
export * from "./form.service";
export * from "./website.service";
export * from "./ai.service";
export * from "./analytics.service";
