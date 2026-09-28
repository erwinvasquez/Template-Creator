import type { Metadata } from "next";
import { loadPayload } from "food-patisserie-v1";
import { PatisserieLabShell } from "../PatisserieLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export const metadata: Metadata = {
  title: "Carrito",
  description: "Carrito preview — Commerce Runtime Contract",
};

export default async function AtelierCartPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <PatisserieLabShell
      page="cart"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
