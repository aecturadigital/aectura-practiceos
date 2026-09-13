import { Form, FormSubmission } from "@/types";

export interface FormService {
  list(tenantId?: string): Promise<Form[]>;
  get(id: string): Promise<Form | undefined>;
  submit(submission: FormSubmission): Promise<FormSubmission>;
}
