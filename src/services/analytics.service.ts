export interface AnalyticsMetrics {
  totalLeads: number;
  bookedAppointments: number;
  conversionRatePercent: number;
  revenueInr: number;
  noShowRatePercent: number;
  leadSources: Array<{ source: string; count: number; percentage: number }>;
  weeklyTrend: Array<{ day: string; enquiries: number; bookings: number }>;
  serviceDistribution: Array<{ name: string; count: number; revenue: number }>;
  practitionerUtilization: Array<{ name: string; bookedHours: number; capacityHours: number; ratePercent: number }>;
  aiStats?: {
    conversations: number;
    autoResolvedRate: number;
    humanHandoffs: number;
    assistedBookings: number;
  };
}

export interface AnalyticsService {
  getMetrics(tenantId: string): Promise<AnalyticsMetrics>;
}
