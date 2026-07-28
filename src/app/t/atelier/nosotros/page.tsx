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
    <AtelierApp page="about" payload={payload} basePath={DEFAULT_BASE_PATH} />
  );
}
