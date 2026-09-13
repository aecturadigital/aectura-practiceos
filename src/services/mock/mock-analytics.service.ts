import { AnalyticsService, AnalyticsMetrics } from "../analytics.service";
import { mockStore } from "@/lib/mock/store";

export class MockAnalyticsService implements AnalyticsService {
  async getMetrics(tenantId: string): Promise<AnalyticsMetrics> {
    const contacts = mockStore.getContacts(tenantId);
    const appointments = mockStore.getAppointments(tenantId);
    const deals = mockStore.getCrmDeals(tenantId);
    const tenant = mockStore.getTenant(tenantId) || mockStore.getActiveTenant();

    const totalLeads = contacts.length;
    const booked = appointments.filter((a) => a.status === "CONFIRMED" || a.status === "COMPLETED").length;
    const conversionRatePercent = totalLeads > 0 ? Math.round((booked / totalLeads) * 100) : 62;
    const revenueInr = deals
      .filter((d) => d.stage === "BOOKED" || d.stage === "VISITED" || d.stage === "CONVERTED")
      .reduce((sum, d) => sum + d.value, 0) || 48600;
    const noShows = appointments.filter((a) => a.status === "NO_SHOW").length;
    const noShowRatePercent = appointments.length > 0 ? Math.round((noShows / appointments.length) * 100) : 4.8;

    const leadSources = [
      { source: "Website Direct", count: 12, percentage: 40 },
      { source: "Google Business Profile", count: 9, percentage: 30 },
      { source: "Doctor & Client Referral", count: 6, percentage: 20 },
      { source: "WhatsApp & Instagram", count: 3, percentage: 10 },
    ];

    const weeklyTrend = [
      { day: "Mon", enquiries: 6, bookings: 4 },
      { day: "Tue", enquiries: 8, bookings: 6 },
      { day: "Wed", enquiries: 5, bookings: 5 },
      { day: "Thu", enquiries: 9, bookings: 7 },
      { day: "Fri", enquiries: 7, bookings: 6 },
      { day: "Sat", enquiries: 11, bookings: 9 },
      { day: "Sun", enquiries: 2, bookings: 1 },
    ];

    const serviceDistribution = tenant.services.slice(0, 4).map((srv, idx) => ({
      name: srv.name.split("(")[0].trim(),
      count: 14 - idx * 3,
      revenue: (14 - idx * 3) * srv.price,
    }));

    const practitionerUtilization = tenant.team
      .filter((t) => t.role === "OWNER" || t.role === "PRACTITIONER")
      .map((p, idx) => ({
        name: p.name,
        bookedHours: 28 - idx * 4,
        capacityHours: 35,
        ratePercent: Math.round(((28 - idx * 4) / 35) * 100),
      }));

    const isAiPlan = tenant.planId === "practiceos_ai";

    return {
      totalLeads,
      bookedAppointments: booked || 12,
      conversionRatePercent,
      revenueInr,
      noShowRatePercent,
      leadSources,
      weeklyTrend,
      serviceDistribution,
      practitionerUtilization,
      aiStats: isAiPlan
        ? {
            conversations: 148,
            autoResolvedRate: 82.4,
            humanHandoffs: 14,
            assistedBookings: 29,
          }
        : undefined,
    };
  }
}

export const mockAnalyticsService = new MockAnalyticsService();
