import type { Metadata } from "next";
import { loadPayload } from "jewelry-orion-v1";
import { OrionLabShell } from "../OrionLabShell";

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

export default async function OrionShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <OrionLabShell page="shop" payload={payload} commerce={sp.commerce} />;
}
