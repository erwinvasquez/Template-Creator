import type { Metadata } from "next";
import { loadPayload } from "fashion-velvet-v1";
import { VelvetLabShell } from "../VelvetLabShell";

type SearchParams = Promise<{ payload?: string }>;

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Cuenta — dashboard preview Celestine",
};

export default async function VelvetAccountDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <VelvetLabShell page="accountDashboard" payload={payload} />;
}
