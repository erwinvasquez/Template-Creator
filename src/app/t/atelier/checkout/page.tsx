import type { Metadata } from "next";
import { loadPayload } from "fashion-atelier-v1";
import { AtelierLabShell } from "../AtelierLabShell";

type SearchParams = Promise<{
  payload?: string;
  commerce?: string;
}>;

export const metadata: Metadata = {
  title: "Checkout",
  description: "Preview de checkout tipado",
};

export default async function AtelierCheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <AtelierLabShell
      page="checkout"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
