import type { Metadata } from "next";
import { loadPayload } from "academy-voxa-v1";
import { VoxaLabShell } from "../VoxaLabShell";

type SearchParams = Promise<{
  payload?: string;
  commerce?: string;
}>;

export const metadata: Metadata = {
  title: "Checkout",
  description: "Preview de checkout tipado",
};

export default async function VoxaCheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <VoxaLabShell
      page="checkout"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
