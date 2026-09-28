import type { Metadata } from "next";
import { loadPayload } from "fashion-velvet-v1";
import { VelvetLabShell } from "../VelvetLabShell";

type SearchParams = Promise<{
  payload?: string;
  commerce?: string;
}>;

export const metadata: Metadata = {
  title: "Checkout",
  description: "Preview de checkout tipado",
};

export default async function VelvetCheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <VelvetLabShell
      page="checkout"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
