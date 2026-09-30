import type { Metadata } from "next";
import { loadPayload } from "fashion-nova-v1";
import { NovaLabShell } from "./NovaLabShell";

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

export default async function NovaHomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <NovaLabShell page="home" payload={payload} commerce={sp.commerce} />
  );
}
