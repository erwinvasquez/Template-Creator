import type { Metadata } from "next";
import { loadPayload } from "academy-voxa-v1";
import { VoxaLabShell } from "../VoxaLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export const metadata: Metadata = {
  title: "Carrito",
  description: "Carrito preview — Commerce Runtime Contract",
};

export default async function VoxaCartPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <VoxaLabShell
      page="cart"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
