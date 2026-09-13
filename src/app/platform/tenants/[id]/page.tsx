import TenantDetailClient from "./tenant-detail-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { id: "tenant-psych-01" },
    { id: "tenant-physio-02" },
    { id: "tenant-dental-03" },
    { id: "tenant-gp-04" },
    { id: "mindwell-psychology" },
    { id: "motionplus-physiotherapy" }
  ];
}

export default function TenantDetailPage() {
  return <TenantDetailClient />;
}
