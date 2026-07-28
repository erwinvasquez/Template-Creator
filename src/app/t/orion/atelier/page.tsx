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
    title: payload.seo.pages?.atelier?.title ?? "Atelier",
    description: payload.seo.pages?.atelier?.description,
  };
}

export default async function OrionAtelierPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <JewelryApp page="atelier" payload={payload} basePath={DEFAULT_BASE_PATH} />
  );
}
