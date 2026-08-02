import type { Metadata } from "next";
import { loadPayload } from "fashion-celestine-v1";
import { CelestineLabShell } from "../CelestineLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export const metadata: Metadata = {
  title: "Carrito",
  description: "Carrito preview — Commerce Runtime Contract",
};

export default async function CelestineCartPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <CelestineLabShell
      page="cart"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
