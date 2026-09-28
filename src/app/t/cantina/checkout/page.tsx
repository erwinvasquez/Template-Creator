import type { Metadata } from "next";
import { loadPayload } from "food-cantina-v1";
import { CantinaLabShell } from "../CantinaLabShell";

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
    <CantinaLabShell
      page="checkout"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
