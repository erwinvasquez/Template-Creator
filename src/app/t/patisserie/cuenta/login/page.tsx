import type { Metadata } from "next";
import { loadPayload } from "food-patisserie-v1";
import { PatisserieLabShell } from "../../PatisserieLabShell";

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
  return <PatisserieLabShell page="accountLogin" payload={payload} />;
}
