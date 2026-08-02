import type { Metadata } from "next";
import { loadPayload } from "fashion-celestine-v1";
import { CelestineLabShell } from "../../CelestineLabShell";

type SearchParams = Promise<{ payload?: string }>;

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Cuenta — login preview Celestine",
};

export default async function CelestineAccountLoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <CelestineLabShell page="accountLogin" payload={payload} />;
}
