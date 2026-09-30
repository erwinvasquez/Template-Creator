import type { Metadata } from "next";
import { loadPayload } from "fashion-nova-v1";
import { NovaLabShell } from "../../NovaLabShell";

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
  return <NovaLabShell page="accountRegister" payload={payload} />;
}
