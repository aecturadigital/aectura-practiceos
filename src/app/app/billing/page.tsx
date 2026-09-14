"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Receipt,
  FileText,
  Send,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useTenant } from "@/context/tenant-context";
import { mockStore } from "@/lib/mock/store";
import {
  Invoice,
  LedgerTransaction,
  PaymentReminder,
  PaymentMethod,
  Contact,
} from "@/types";

export default function BillingPage() {
  const { activeTenant, vertical } = useTenant();

  const [activeTab, setActiveTab] = useState<
    "ledgers" | "invoices" | "reminders" | "transactions"
  >("ledgers");

  const contacts = mockStore.getContacts(activeTenant.id);
  // Default to Priya Sharma if available, otherwise first contact
  const [selectedContactId, setSelectedContactId] = useState(
    contacts.find((c) => c.fullName.includes("Priya"))?.id || contacts[0]?.id || "cnt-mp-priya"
  );

  const selectedContact = mockStore.getContact(selectedContactId) || contacts[0];
  const ledger = mockStore.getPatientLedger(activeTenant.id, selectedContactId);
  const invoices = mockStore.getInvoices(activeTenant.id);
  const reminders = mockStore.getPaymentReminders(activeTenant.id);
  const allTransactions = mockStore.getLedgerTransactions(activeTenant.id);

  // Filter states
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<string>("ALL");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>("ALL");

  // Modals state
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(ledger.netOutstanding || 5000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentMemo, setPaymentMemo] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [invContactId, setInvContactId] = useState(selectedContactId);
  const [invType, setInvType] = useState<Invoice["type"]>("INVOICE");
  const [invTitle, setInvTitle] = useState("Physiotherapy Treatment Cycle");
  const [invAmount, setInvAmount] = useState(15000);
  const [invSuccess, setInvSuccess] = useState(false);

  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const [isSendReminderOpen, setIsSendReminderOpen] = useState(false);
  const [reminderTargetId, setReminderTargetId] = useState(selectedContactId);
  const [reminderAmount, setReminderAmount] = useState(ledger.netOutstanding || 5800);
  const [reminderMsg, setReminderMsg] = useState("");
  const [reminderSuccess, setReminderSuccess] = useState(false);

  // Online settlement simulation toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount) return;

    mockStore.recordLedgerPayment(
      activeTenant.id,
      selectedContactId,
      Number(paymentAmount),
      paymentMethod,
      paymentRef || `TXN-${Date.now()}`,
      paymentMemo || "Settled at clinic desk",
      "Billing Desk"
    );

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setIsRecordPaymentOpen(false);
      setPaymentRef("");
      setPaymentMemo("");
    }, 1200);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const contact = mockStore.getContact(invContactId);

    mockStore.createInvoice({
      tenantId: activeTenant.id,
      contactId: invContactId,
      contactName: contact?.fullName || "Patient",
      contactPhone: contact?.phone || "+91 98260 00000",
      contactEmail: contact?.email || "patient@example.com",
      type: invType,
      invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
      items: [
        {
          description: invTitle,
          quantity: 1,
          unitPrice: Number(invAmount),
          total: Number(invAmount),
          isCoveredByPlan: true,
        },
      ],
      subtotal: Number(invAmount),
      discount: 0,
      tax: 0,
      totalAmount: Number(invAmount),
      paidAmount: 0,
      balanceDue: Number(invAmount),
      status: "SENT",
      notes: "Payable via UPI, Net Banking or at reception desk.",
    });

    setInvSuccess(true);
    setTimeout(() => {
      setInvSuccess(false);
      setIsCreateInvoiceOpen(false);
    }, 1200);
  };

  const handleSendReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetContact = mockStore.getContact(reminderTargetId);

    mockStore.sendPaymentReminder(
      activeTenant.id,
      reminderTargetId,
      Number(reminderAmount),
      "WHATSAPP",
      reminderMsg ||
        `Dear ${targetContact?.fullName}, your payment of ₹${reminderAmount} for treatment services is due. Pay online at https://pay.aectura.in/${reminderTargetId} or at reception. Thank you!`,
      "Billing Desk"
    );

    setReminderSuccess(true);
    setTimeout(() => {
      setReminderSuccess(false);
      setIsSendReminderOpen(false);
      setReminderMsg("");
    }, 1200);
  };

  const handleSimulateOnlinePayment = (reminderId: string) => {
    mockStore.simulateOnlinePayment(reminderId);
    setToastMessage("Payment simulated: ₹5,800 received via Razorpay payment link. Ledger credited!");
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered lists
  const filteredInvoices = invoices.filter(
    (inv) => invoiceTypeFilter === "ALL" || inv.type === invoiceTypeFilter
  );

  const filteredTransactions = allTransactions.filter(
    (tx) => transactionTypeFilter === "ALL" || tx.type === transactionTypeFilter
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
              Billing &amp; Financial Ledger
            </h1>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Practice Finance Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Double-sided patient statements, invoices, GST receipts, and automated payment reminders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPaymentAmount(ledger.netOutstanding || 5000);
              setIsRecordPaymentOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => setIsCreateInvoiceOpen(true)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md border border-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Top 4 Financial Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Total Billed (MTD)</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 font-mono">
            ₹1,48,500
          </p>
          <p className="text-xs text-slate-500 mt-1">Across 18 care packages &amp; add-ons</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Collected Revenue</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-semibold text-emerald-700 font-mono">
            ₹1,22,700
          </p>
          <p className="text-xs text-emerald-700 mt-1 font-medium">82.6% collection efficiency</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Net Outstanding</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-semibold text-rose-600 font-mono">
            ₹25,800
          </p>
          <p className="text-xs text-rose-600 mt-1">4 patients with due balances</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-none">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-500">Active Reminders</span>
            <Send className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-semibold text-slate-900 font-mono">
            {reminders.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Dispatched via WhatsApp &amp; SMS</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-medium text-slate-500">
        <button
          onClick={() => setActiveTab("ledgers")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "ledgers"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Patient Statements &amp; Ledgers
        </button>

        <button
          onClick={() => setActiveTab("invoices")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "invoices"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Invoices &amp; Receipts ({invoices.length})
        </button>

        <button
          onClick={() => setActiveTab("reminders")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "reminders"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Payment Reminders ({reminders.length})
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`pb-2.5 transition-colors border-b-2 whitespace-nowrap ${
            activeTab === "transactions"
              ? "border-teal-600 text-teal-800 font-semibold"
              : "border-transparent hover:text-slate-900"
          }`}
        >
          Clinic Transaction Register
        </button>
      </div>

      {/* TAB 1: PATIENT STATEMENTS & LEDGERS */}
      {activeTab === "ledgers" && (
        <div className="space-y-6">
          {/* Patient Selector Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 shrink-0">
                Select Patient:
              </label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-medium text-slate-900"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setReminderTargetId(selectedContactId);
                  setReminderAmount(ledger.netOutstanding || 5800);
                  setReminderMsg(
                    `Dear ${selectedContact?.fullName}, this is ${activeTenant.name}. You have an outstanding balance of ₹${ledger.netOutstanding.toLocaleString("en-IN")}. You can settle securely online at https://pay.aectura.in/${selectedContactId} or at reception. Thank you!`
                  );
                  setIsSendReminderOpen(true);
                }}
                disabled={ledger.netOutstanding === 0}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-teal-600" />
                <span>Send WhatsApp Reminder</span>
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Statement</span>
              </button>
            </div>
          </div>

          {/* Statement Overview Header */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {selectedContact?.fullName}
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  ID: {selectedContactId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedContact?.phone} &bull; {selectedContact?.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="bg-white px-3 py-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Total Charges</span>
                <span className="font-bold text-slate-900">
                  ₹{ledger.totalCharges.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="bg-white px-3 py-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-sans">Total Paid</span>
                <span className="font-bold text-emerald-700">
                  ₹{ledger.totalPayments.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="bg-rose-50 px-3 py-2 rounded border border-rose-200">
                <span className="text-rose-500 block text-[10px] uppercase font-sans font-semibold">Net Balance Due</span>
                <span className="font-bold text-rose-700">
                  ₹{ledger.netOutstanding.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Double-Sided Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Itemized Transaction History
              </h4>
              <span className="text-[11px] text-slate-400">
                {ledger.transactions.length} entries recorded
              </span>
            </div>

            {ledger.transactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No ledger entries recorded for this patient.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Method / Ref</th>
                      <th className="py-2.5 px-3 text-right">Debit (+)</th>
                      <th className="py-2.5 px-3 text-right">Credit (-)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledger.transactions.map((tx) => {
                      const isCharge = tx.type === "CHARGE" || tx.type === "PACKAGE_SALE" || tx.type === "ADD_ON_SERVICE";
                      const isPayment = tx.type === "PAYMENT";
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-mono text-slate-600">{tx.date}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isCharge
                                  ? "bg-slate-100 text-slate-700"
                                  : isPayment
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900">{tx.description}</td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono">
                            {tx.method || tx.referenceNumber || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900">
                            {isCharge ? `+₹${tx.amount.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                            {isPayment ? `-₹${tx.amount.toLocaleString("en-IN")}` : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES & RECEIPTS */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Type:</span>
              <select
                value={invoiceTypeFilter}
                onChange={(e) => setInvoiceTypeFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
              >
                <option value="ALL">All Documents</option>
                <option value="INVOICE">Invoices</option>
                <option value="RECEIPT">Receipts</option>
                <option value="QUOTE">Estimates &amp; Quotes</option>
                <option value="STATEMENT">Statements</option>
              </select>
            </div>

            <button
              onClick={() => setIsCreateInvoiceOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Invoice</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Doc Number</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/app/contacts/${inv.contactId}`}
                          className="font-medium text-slate-900 hover:text-teal-700"
                        >
                          {inv.contactName}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {inv.type}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{inv.date}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{inv.dueDate}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                        ₹{inv.totalAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        {inv.balanceDue > 0 ? `₹${inv.balanceDue.toLocaleString("en-IN")}` : "₹0"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            inv.status === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : inv.status === "PARTIAL"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="text-teal-700 hover:text-teal-800 font-medium"
                        >
                          View &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENT REMINDERS */}
      {activeTab === "reminders" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Staff-triggered payment reminders with WhatsApp dispatch simulation and instant online payment links.
            </p>
            <button
              onClick={() => {
                setReminderTargetId(selectedContactId);
                setReminderAmount(5800);
                setIsSendReminderOpen(true);
              }}
              className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send New Reminder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-3 shadow-none"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-900 text-sm block">
                        {rem.contactName}
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        Channel: {rem.channel} &bull; Due: {rem.dueDate}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-rose-600 text-sm block">
                        ₹{rem.amountDue.toLocaleString("en-IN")}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          rem.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-teal-50 text-teal-700 border border-teal-200"
                        }`}
                      >
                        {rem.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 p-3 bg-slate-50 rounded border border-slate-200 leading-relaxed font-sans">
                    &ldquo;{rem.messageText}&rdquo;
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Dispatched by {rem.dispatchedBy || "Front Desk"}
                  </span>
                  {rem.status !== "PAID" && (
                    <button
                      onClick={() => handleSimulateOnlinePayment(rem.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium transition-colors shadow-xs"
                    >
                      Simulate Patient Paying Online
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CLINIC TRANSACTION REGISTER */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Filter Type:</span>
              <select
                value={transactionTypeFilter}
                onChange={(e) => setTransactionTypeFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
              >
                <option value="ALL">All Entries</option>
                <option value="PAYMENT">Payments Only</option>
                <option value="CHARGE">Charges Only</option>
                <option value="PACKAGE_SALE">Package Sales</option>
                <option value="ADD_ON_SERVICE">Procedure Add-Ons</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Method / Ref</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => {
                    const isCharge = tx.type === "CHARGE" || tx.type === "PACKAGE_SALE" || tx.type === "ADD_ON_SERVICE";
                    const isPayment = tx.type === "PAYMENT";
                    const contact = mockStore.getContact(tx.contactId);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-4 font-mono text-slate-600">{tx.date}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {contact?.fullName || tx.contactId}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isCharge
                                ? "bg-slate-100 text-slate-700"
                                : isPayment
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-800">{tx.description}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">
                          {tx.method || tx.referenceNumber || "—"}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-bold ${
                            isPayment ? "text-emerald-700" : "text-slate-900"
                          }`}
                        >
                          {isPayment ? "-" : "+"}₹{tx.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isRecordPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Record Patient Payment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter payment details for {selectedContact?.fullName}. Immediately updates ledger balance.
            </p>

            {paymentSuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-medium flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <span>Payment recorded successfully! Receipt generated.</span>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Patient</label>
                  <input
                    type="text"
                    disabled
                    value={selectedContact?.fullName || ""}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                      <option value="Payment Link">Online Payment Link</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Transaction Ref / UTR</label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-20260914-998811"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Internal Memo</label>
                  <input
                    type="text"
                    placeholder="e.g. Settled at desk after dry needling session"
                    value={paymentMemo}
                    onChange={(e) => setPaymentMemo(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRecordPaymentOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                  >
                    Confirm &amp; Record Receipt
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {isCreateInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Create New Invoice
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Issue an itemized billing document to the patient or insurance provider.
            </p>

            {invSuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-medium flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <span>Invoice created and added to ledger!</span>
              </div>
            ) : (
              <form onSubmit={handleCreateInvoice} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Patient</label>
                  <select
                    value={invContactId}
                    onChange={(e) => setInvContactId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Document Type</label>
                    <select
                      value={invType}
                      onChange={(e) => setInvType(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                    >
                      <option value="INVOICE">Tax Invoice</option>
                      <option value="QUOTE">Estimate / Quote</option>
                      <option value="RECEIPT">Receipt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={invAmount}
                      onChange={(e) => setInvAmount(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Service Description</label>
                  <input
                    type="text"
                    required
                    value={invTitle}
                    onChange={(e) => setInvTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateInvoiceOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                  >
                    Create &amp; Issue
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs text-slate-400 font-mono block">TAX INVOICE</span>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {viewingInvoice.invoiceNumber}
                </h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                {viewingInvoice.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Billed To:</span>
                <span className="font-semibold text-slate-900 block">{viewingInvoice.contactName}</span>
                <span className="text-slate-500 block">{viewingInvoice.contactPhone}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block mb-0.5">Invoice Date:</span>
                <span className="font-mono text-slate-700 block">{viewingInvoice.date}</span>
                <span className="text-slate-400 block mt-1 mb-0.5">Due Date:</span>
                <span className="font-mono text-slate-700 block">{viewingInvoice.dueDate}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 text-slate-800">{it.description}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">{it.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono font-medium text-slate-900">
                        ₹{it.total.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-xs font-mono pt-2">
              <span className="text-slate-500">Total Payable:</span>
              <span className="text-base font-bold text-slate-900">
                ₹{viewingInvoice.totalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 text-xs text-slate-700 rounded-md border border-slate-200 hover:bg-slate-50"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Payment Reminder Modal */}
      {isSendReminderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Dispatch Payment Reminder
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sends an official clinic WhatsApp notification with an embedded payment link.
            </p>

            {reminderSuccess ? (
              <div className="py-6 text-center text-emerald-700 text-xs font-medium flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <span>WhatsApp reminder dispatched successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSendReminderSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Patient</label>
                  <select
                    value={reminderTargetId}
                    onChange={(e) => setReminderTargetId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white"
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Amount Due (₹)</label>
                  <input
                    type="number"
                    required
                    value={reminderAmount}
                    onChange={(e) => setReminderAmount(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Message Body</label>
                  <textarea
                    rows={4}
                    required
                    value={reminderMsg}
                    onChange={(e) => setReminderMsg(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:outline-none focus:border-teal-600 bg-white leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSendReminderOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-md border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-md transition-colors"
                  >
                    Dispatch via WhatsApp
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
