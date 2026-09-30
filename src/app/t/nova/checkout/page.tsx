import type { Metadata } from "next";
import { loadPayload } from "fashion-nova-v1";
import { NovaLabShell } from "../NovaLabShell";

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
    <NovaLabShell
      page="checkout"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
