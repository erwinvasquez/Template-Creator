import type { Metadata } from "next";
import { loadPayload } from "academy-voxa-v1";
import { VoxaLabShell } from "../../VoxaLabShell";

type SearchParams = Promise<{ payload?: string }>;

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Cuenta — login preview Voxa",
};

export default async function VoxaAccountLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <VoxaLabShell page="accountLogin" payload={payload} />;
}
