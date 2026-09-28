import type { Metadata } from "next";
import { loadPayload } from "food-cantina-v1";
import { CantinaLabShell } from "../../CantinaLabShell";

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
  return <CantinaLabShell page="accountRegister" payload={payload} />;
}
