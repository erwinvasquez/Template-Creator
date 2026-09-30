import type { Metadata } from "next";
import { loadPayload } from "food-patisserie-v1";
import { PatisserieLabShell } from "../../PatisserieLabShell";

type SearchParams = Promise<{ payload?: string }>;

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Cuenta — registro preview Atelier",
};

export default async function AtelierAccountRegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <PatisserieLabShell page="accountRegister" payload={payload} />;
}
