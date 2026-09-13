import ContactDetailPageClient from "./contact-detail-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { id: "cnt-01" },
    { id: "cnt-02" },
    { id: "cnt-03" },
    { id: "cnt-04" },
    { id: "cnt-05" },
    { id: "cnt-06" },
    { id: "c1" },
    { id: "c2" },
    { id: "c3" }
  ];
}

export default function ContactDetailPage() {
  return <ContactDetailPageClient />;
}
