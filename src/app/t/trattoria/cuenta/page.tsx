import type { Metadata } from "next";
import { loadPayload } from "food-trattoria-v1";
import { TrattoriaLabShell } from "../TrattoriaLabShell";

type SearchParams = Promise<{ payload?: string }>;

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Cuenta — dashboard preview Trattoria",
};

export default async function TrattoriaAccountDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <TrattoriaLabShell page="accountDashboard" payload={payload} />;
}
