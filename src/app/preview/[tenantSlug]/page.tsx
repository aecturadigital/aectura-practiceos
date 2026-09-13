import { notFound } from "next/navigation";
import { mockStore } from "@/lib/mock/store";
import { PublicPracticeWebsite } from "@/components/public-practice-website";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { tenantSlug: "mindwell-psychology" },
    { tenantSlug: "motionplus-physiotherapy" }
  ];
}

export default function PreviewPage({
  params,
}: {
  params: { tenantSlug: string };
}) {
  const tenant = mockStore.getTenant(params.tenantSlug);

  if (!tenant) {
    notFound();
  }

  return <PublicPracticeWebsite tenant={tenant} isPreview={true} />;
}
