import type { Metadata } from "next";
import { loadPayload } from "food-patisserie-v1";
import { PatisserieLabShell } from "../PatisserieLabShell";

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
    <PatisserieLabShell
      page="checkout"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
