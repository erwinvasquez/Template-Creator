"use client";

import type { OrderConfirmationViewProps } from "@shopenlinea/commerce-runtime-contract";
import { OrderConfirmationStandardView } from "@shopenlinea/commerce-runtime-contract";

export function OrderConfirmationView(props: OrderConfirmationViewProps) {
  return <OrderConfirmationStandardView {...props} />;
}
