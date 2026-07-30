import type { Metadata } from "next";
import { loadPayload } from "fashion-atelier-v1";
import { AtelierLabShell } from "../../AtelierLabShell";

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
  return <AtelierLabShell page="accountRegister" payload={payload} />;
}
