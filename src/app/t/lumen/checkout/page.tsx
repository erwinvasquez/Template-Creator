import type { Metadata } from "next";
import { loadPayload } from "fashion-lumen-v1";
import { LumenLabShell } from "../LumenLabShell";

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
    <LumenLabShell
      page="checkout"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
