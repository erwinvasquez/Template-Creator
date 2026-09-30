import type { Metadata } from "next";
import { loadPayload } from "fashion-lumen-v1";
import { LumenLabShell } from "../../LumenLabShell";

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
  return <LumenLabShell page="accountLogin" payload={payload} />;
}
