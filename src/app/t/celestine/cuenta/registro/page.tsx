import type { Metadata } from "next";
import { loadPayload } from "fashion-celestine-v1";
import { CelestineLabShell } from "../../CelestineLabShell";

type SearchParams = Promise<{ payload?: string }>;

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Cuenta — registro preview Celestine",
};

export default async function CelestineAccountRegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <CelestineLabShell page="accountRegister" payload={payload} />;
}
