import { Appointment, AppointmentStatus } from "@/types";

export interface AppointmentFilterOptions {
  practitionerId?: string;
  date?: string;
  status?: AppointmentStatus;
}

export interface AppointmentService {
  list(tenantId?: string, filters?: AppointmentFilterOptions): Promise<Appointment[]>;
  get(id: string): Promise<Appointment | undefined>;
  create(appointment: Appointment): Promise<Appointment>;
  updateStatus(id: string, status: AppointmentStatus, reason?: string): Promise<void>;
  reschedule(id: string, newDate: string, newTime: string): Promise<void>;
}
