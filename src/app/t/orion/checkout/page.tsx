import type { Metadata } from "next";
import { loadPayload } from "jewelry-orion-v1";
import { OrionLabShell } from "../OrionLabShell";

type SearchParams = Promise<{
  payload?: string;
  commerce?: string;
}>;

export const metadata: Metadata = {
  title: "Checkout",
  description: "Preview de checkout tipado",
};

export default async function OrionCheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <OrionLabShell
      page="checkout"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
