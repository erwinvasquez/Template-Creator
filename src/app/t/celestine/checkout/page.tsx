import type { Metadata } from "next";
import { loadPayload } from "fashion-celestine-v1";
import { CelestineLabShell } from "../CelestineLabShell";

type SearchParams = Promise<{
  payload?: string;
  commerce?: string;
}>;

export const metadata: Metadata = {
  title: "Checkout",
  description: "Preview de checkout tipado",
};

export default async function CelestineCheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <CelestineLabShell
      page="checkout"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
