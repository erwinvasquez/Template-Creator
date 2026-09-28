import type { Metadata } from "next";
import { loadPayload } from "food-trattoria-v1";
import { TrattoriaLabShell } from "../TrattoriaLabShell";

type SearchParams = Promise<{
  payload?: string;
  commerce?: string;
}>;

export const metadata: Metadata = {
  title: "Checkout",
  description: "Preview de checkout tipado",
};

export default async function TrattoriaCheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <TrattoriaLabShell
      page="checkout"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
