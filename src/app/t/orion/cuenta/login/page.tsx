import type { Metadata } from "next";
import { loadPayload } from "jewelry-orion-v1";
import { OrionLabShell } from "../../OrionLabShell";

type SearchParams = Promise<{ payload?: string }>;

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Cuenta — login preview Orion",
};

export default async function OrionAccountLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <OrionLabShell page="accountLogin" payload={payload} />;
}
