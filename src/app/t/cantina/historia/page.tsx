import type { Metadata } from "next";
import { loadPayload } from "food-cantina-v1";
import { CantinaLabShell } from "../CantinaLabShell";

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
    <CantinaLabShell page="about" payload={payload} commerce={sp.commerce} />
  );
}
