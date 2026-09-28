import type { Metadata } from "next";
import { loadPayload } from "food-trattoria-v1";
import { TrattoriaLabShell } from "../TrattoriaLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export const metadata: Metadata = {
  title: "Carrito",
  description: "Carrito preview — Commerce Runtime Contract",
};

export default async function TrattoriaCartPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <TrattoriaLabShell
      page="cart"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
