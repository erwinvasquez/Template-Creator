import type { Metadata } from "next";
import { loadPayload } from "fashion-celestine-v1";
import { CelestineLabShell } from "../CelestineLabShell";

type SearchParams = Promise<{ payload?: string }>;

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Cuenta — dashboard preview Celestine",
};

export default async function CelestineAccountDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const payload = loadPayload(sp.payload);
  return <CelestineLabShell page="accountDashboard" payload={payload} />;
}
