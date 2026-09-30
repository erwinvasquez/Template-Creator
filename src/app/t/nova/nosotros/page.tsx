import type { Metadata } from "next";
import { loadPayload } from "fashion-nova-v1";
import { NovaLabShell } from "../NovaLabShell";

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
    <NovaLabShell page="about" payload={payload} commerce={sp.commerce} />
  );
}
