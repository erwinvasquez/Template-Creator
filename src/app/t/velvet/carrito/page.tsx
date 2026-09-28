import type { Metadata } from "next";
import { loadPayload } from "fashion-velvet-v1";
import { VelvetLabShell } from "../VelvetLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export const metadata: Metadata = {
  title: "Carrito",
  description: "Carrito preview — Commerce Runtime Contract",
};

export default async function VelvetCartPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <VelvetLabShell
      page="cart"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
