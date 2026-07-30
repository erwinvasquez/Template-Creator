import type { Metadata } from "next";
import { loadPayload } from "fashion-atelier-v1";
import { AtelierLabShell } from "../AtelierLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return {
    title: payload.seo.pages?.shop?.title ?? "Tienda",
    description: payload.seo.pages?.shop?.description,
  };
}

export default async function AtelierShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <AtelierLabShell page="shop" payload={payload} commerce={sp.commerce} />
  );
}
