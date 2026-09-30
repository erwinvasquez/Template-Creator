import type { Metadata } from "next";
import { loadPayload } from "fashion-lumen-v1";
import { LumenLabShell } from "../LumenLabShell";

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
    <LumenLabShell
      page="cart"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
