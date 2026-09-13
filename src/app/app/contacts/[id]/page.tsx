import ContactDetailPageClient from "./contact-detail-client";
import { SEED_MINDWELL_CONTACTS, SEED_MOTIONPLUS_CONTACTS } from "@/lib/mock/seed";

export const dynamicParams = true;

export function generateStaticParams() {
  const allContactIds = [
    "cnt-01",
    ...SEED_MINDWELL_CONTACTS.map((c) => c.id),
    ...SEED_MOTIONPLUS_CONTACTS.map((c) => c.id),
  ];
  return allContactIds.map((id) => ({ id }));
}

export default function ContactDetailPage() {
  return <ContactDetailPageClient />;
}
