import {
  LedgerTransaction,
  Invoice,
  PaymentReminder,
  PaymentMethod,
  LedgerTransactionType,
} from "@/types";
import { mockStore } from "@/lib/mock/store";

export interface PatientLedgerSummary {
  contactId: string;
  totalCharges: number;
  totalPayments: number;
  totalDiscounts: number;
  totalWaivers: number;
  netOutstanding: number;
  transactions: LedgerTransaction[];
}

export interface IBillingService {
  getLedger(tenantId: string, contactId: string): PatientLedgerSummary;
  getAllTransactions(tenantId: string): LedgerTransaction[];
  recordCharge(
    tenantId: string,
    contactId: string,
    amount: number,
    description: string,
    category: LedgerTransaction["category"],
    referenceNumber?: string
  ): LedgerTransaction;
  recordPayment(
    tenantId: string,
    contactId: string,
    amount: number,
    method: PaymentMethod,
    referenceNumber: string,
    memo: string,
    receivedBy: string
  ): LedgerTransaction;
  getInvoices(tenantId: string, contactId?: string): Invoice[];
  createInvoice(invoice: Omit<Invoice, "id" | "createdAt">): Invoice;
  getPaymentReminders(tenantId: string): PaymentReminder[];
  sendPaymentReminder(
    tenantId: string,
    contactId: string,
    amountDue: number,
    channel: "WHATSAPP" | "SMS" | "EMAIL",
    messageText: string,
    dispatchedBy: string
  ): PaymentReminder;
  simulateOnlinePayment(reminderId: string): void;
}

export class MockBillingService implements IBillingService {
  getLedger(tenantId: string, contactId: string): PatientLedgerSummary {
    return mockStore.getPatientLedger(tenantId, contactId);
  }

  getAllTransactions(tenantId: string): LedgerTransaction[] {
    return mockStore.getLedgerTransactions(tenantId);
  }

  recordCharge(
    tenantId: string,
    contactId: string,
    amount: number,
    description: string,
    category: LedgerTransaction["category"],
    referenceNumber?: string
  ): LedgerTransaction {
    return mockStore.recordLedgerCharge(tenantId, contactId, amount, description, category, referenceNumber);
  }

  recordPayment(
    tenantId: string,
    contactId: string,
    amount: number,
    method: PaymentMethod,
    referenceNumber: string,
    memo: string,
    receivedBy: string
  ): LedgerTransaction {
    return mockStore.recordLedgerPayment(tenantId, contactId, amount, method, referenceNumber, memo, receivedBy);
  }

  getInvoices(tenantId: string, contactId?: string): Invoice[] {
    return mockStore.getInvoices(tenantId, contactId);
  }

  createInvoice(invoice: Omit<Invoice, "id" | "createdAt">): Invoice {
    return mockStore.createInvoice(invoice);
  }

  getPaymentReminders(tenantId: string): PaymentReminder[] {
    return mockStore.getPaymentReminders(tenantId);
  }

  sendPaymentReminder(
    tenantId: string,
    contactId: string,
    amountDue: number,
    channel: "WHATSAPP" | "SMS" | "EMAIL",
    messageText: string,
    dispatchedBy: string
  ): PaymentReminder {
    return mockStore.sendPaymentReminder(tenantId, contactId, amountDue, channel, messageText, dispatchedBy);
  }

  simulateOnlinePayment(reminderId: string): void {
    mockStore.simulateOnlinePayment(reminderId);
  }
}

export const billingService = new MockBillingService();
