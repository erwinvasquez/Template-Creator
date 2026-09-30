import type { Metadata } from "next";
import { loadPayload } from "fashion-nova-v1";
import { NovaLabShell } from "../NovaLabShell";

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
  return <NovaLabShell page="accountDashboard" payload={payload} />;
}
