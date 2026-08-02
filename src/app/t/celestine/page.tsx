import type { Metadata } from "next";
import { loadPayload } from "fashion-celestine-v1";
import { CelestineLabShell } from "./CelestineLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

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

export default async function CelestineHomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <CelestineLabShell page="home" payload={payload} commerce={sp.commerce} />;
}
