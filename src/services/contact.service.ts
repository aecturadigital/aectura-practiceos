import { Contact } from "@/types";

export interface ContactFilterOptions {
  status?: string;
  search?: string;
  practitionerId?: string;
  tag?: string;
}

export interface ContactService {
  list(tenantId?: string, filters?: ContactFilterOptions): Promise<Contact[]>;
  get(id: string): Promise<Contact | undefined>;
  create(contact: Contact): Promise<Contact>;
  update(id: string, updates: Partial<Contact>): Promise<Contact | undefined>;
  delete(id: string): Promise<boolean>;
}
