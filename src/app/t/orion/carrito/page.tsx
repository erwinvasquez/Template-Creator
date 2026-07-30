import type { Metadata } from "next";
import { loadPayload } from "jewelry-orion-v1";
import { OrionLabShell } from "../OrionLabShell";

type SearchParams = Promise<{ payload?: string; commerce?: string }>;

export const metadata: Metadata = {
  title: "Carrito",
  description: "Carrito preview — Commerce Runtime Contract",
};

export default async function OrionCartPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return (
    <OrionLabShell
      page="cart"
      payload={payload}
      commerce={sp.commerce}
    />
  );
}
