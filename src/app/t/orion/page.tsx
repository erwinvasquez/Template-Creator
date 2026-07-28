import type { Metadata } from "next";
import {
  DEFAULT_BASE_PATH,
  loadPayload,
  JewelryApp,
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
    title: {
      default: payload.seo.default.title,
      template: payload.seo.titleTemplate,
    },
    description: payload.seo.default.description,
  };
}

export default async function OrionHomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <JewelryApp page="home" payload={payload} basePath={DEFAULT_BASE_PATH} />
  );
}
