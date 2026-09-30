import type { Metadata } from "next";
import { loadPayload } from "food-trattoria-v1";
import { TrattoriaLabShell } from "../TrattoriaLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return {
    title: payload.seo.pages?.shop?.title ?? "Colección",
    description: payload.seo.pages?.shop?.description,
  };
}

export default async function TrattoriaShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <TrattoriaLabShell page="shop" payload={payload} commerce={sp.commerce} />;
}
