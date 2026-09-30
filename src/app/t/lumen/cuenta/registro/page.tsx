import type { Metadata } from "next";
import { loadPayload } from "fashion-lumen-v1";
import { LumenLabShell } from "../../LumenLabShell";

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
  return <LumenLabShell page="accountRegister" payload={payload} />;
}
