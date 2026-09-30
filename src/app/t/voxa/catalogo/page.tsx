import type { Metadata } from "next";
import { loadPayload } from "academy-voxa-v1";
import { VoxaLabShell } from "../VoxaLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return {
    title: payload.seo.pages?.shop?.title ?? "Catálogo",
    description: payload.seo.pages?.shop?.description,
  };
}

export default async function VoxaShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <VoxaLabShell page="shop" payload={payload} commerce={sp.commerce} />;
}
