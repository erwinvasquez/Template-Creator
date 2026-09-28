import type { Metadata } from "next";
import { loadPayload } from "fashion-nova-v1";
import { NovaLabShell } from "../../NovaLabShell";

type SearchParams = Promise<{ payload?: string }>;

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Cuenta — login preview Atelier",
};

export default async function AtelierAccountLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <NovaLabShell page="accountLogin" payload={payload} />;
}
