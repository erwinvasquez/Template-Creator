import type { Metadata } from "next";
import { loadPayload } from "fashion-atelier-v1";
import { AtelierLabShell } from "../AtelierLabShell";

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
    <AtelierLabShell
      page="cart"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
