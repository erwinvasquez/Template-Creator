import type { Metadata } from "next";
import { loadPayload } from "fashion-velvet-v1";
import { VelvetLabShell } from "../VelvetLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return {
    title: payload.seo.pages?.about?.title ?? "La casa",
    description: payload.seo.pages?.about?.description,
  };
}

export default async function VelvetAboutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <VelvetLabShell page="about" payload={payload} commerce={sp.commerce} />
  );
}
