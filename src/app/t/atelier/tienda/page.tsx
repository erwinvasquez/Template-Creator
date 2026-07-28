import type { Metadata } from "next";
import {
  AtelierApp,
  DEFAULT_BASE_PATH,
  loadPayload,
} from "fashion-atelier-v1";

type SearchParams = Promise<{ payload?: string }>;

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
    <AtelierApp page="shop" payload={payload} basePath={DEFAULT_BASE_PATH} />
  );
}
