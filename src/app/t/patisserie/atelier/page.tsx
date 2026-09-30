import type { Metadata } from "next";
import { loadPayload } from "food-patisserie-v1";
import { PatisserieLabShell } from "../PatisserieLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return {
    title: payload.seo.pages?.about?.title ?? "Nosotros",
    description: payload.seo.pages?.about?.description,
  };
}

export default async function AtelierAboutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <PatisserieLabShell page="about" payload={payload} commerce={sp.commerce} />
  );
}
