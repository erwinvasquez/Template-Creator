import type { Metadata } from "next";
import { loadPayload } from "fashion-atelier-v1";
import { AtelierLabShell } from "../AtelierLabShell";

type SearchParams = Promise<{ payload?: string }>;

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Cuenta — dashboard preview Atelier",
};

export default async function AtelierAccountDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <AtelierLabShell page="accountDashboard" payload={payload} />;
}
