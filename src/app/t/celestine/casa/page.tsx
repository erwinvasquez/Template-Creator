import type { Metadata } from "next";
import { loadPayload } from "fashion-celestine-v1";
import { CelestineLabShell } from "../CelestineLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return {
    title: payload.seo.pages?.about?.title ?? "La casa",
    description: payload.seo.pages?.about?.description,
  };
}

export default async function CelestineAboutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <CelestineLabShell page="about" payload={payload} commerce={sp.commerce} />
  );
}
