import type { Metadata } from "next";
import { loadPayload } from "food-cantina-v1";
import { CantinaLabShell } from "../CantinaLabShell";

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
  return <CantinaLabShell page="accountDashboard" payload={payload} />;
}
