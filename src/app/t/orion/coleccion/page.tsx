import type { Metadata } from "next";
import {
  JewelryApp,
  DEFAULT_BASE_PATH,
  loadPayload,
} from "jewelry-orion-v1";

type SearchParams = Promise<{ payload?: string }>;

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
  return (
    <JewelryApp page="shop" payload={payload} basePath={DEFAULT_BASE_PATH} />
  );
}
