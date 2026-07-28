import type { Metadata } from "next";
import {
  DEFAULT_BASE_PATH,
  loadPayload,
  AtelierApp,
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
    title: {
      default: payload.seo.default.title,
      template: payload.seo.titleTemplate,
    },
    description: payload.seo.default.description,
  };
}

export default async function AtelierHomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <AtelierApp page="home" payload={payload} basePath={DEFAULT_BASE_PATH} />
  );
}
