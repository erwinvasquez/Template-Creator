"use client";

import type {
  CommerceTemplateCapabilities,
  ProductFilterViewModel,
} from "@shopenlinea/commerce-runtime-contract";
import { useSiteContent } from "../../lib/site-content";
import { showsSalesModeChrome } from "../../lib/sales-mode";

type Props = {
  filters: ProductFilterViewModel;
  capabilities: CommerceTemplateCapabilities;
};

export function SalesModeShopBanner({ filters, capabilities }: Props) {
  const { payload } = useSiteContent();
  if (!showsSalesModeChrome(capabilities)) return null;

  const ui = payload.ui?.salesMode;
  if (!ui) return null;

  const mode = filters.salesMode;

  if (mode === "stock") {
    const banner = ui.stock?.shopBanner;
    if (!banner) return null;
    return (
      <div
        className="mb-8 rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-muted"
        role="status"
      >
        {banner}
      </div>
    );
  }

  if (mode === "madeToOrder") {
    const lines: string[] = [];
    if (ui.madeToOrder?.shopBanner) lines.push(ui.madeToOrder.shopBanner);
    if (filters.preparationPromiseLabel) {
      const prefix = ui.madeToOrder?.preparationLabel ?? "Preparación";
      lines.push(`${prefix}: ${filters.preparationPromiseLabel}`);
    }
    if (filters.madeToOrderAcceptingOrders === false) {
      let closed = ui.madeToOrder?.closedMessage ?? "";
      if (filters.madeToOrderReopensAtLabel) {
        const prefix = ui.madeToOrder?.reopensPrefix;
        closed = prefix
          ? `${closed} ${prefix} ${filters.madeToOrderReopensAtLabel}`.trim()
          : `${closed} ${filters.madeToOrderReopensAtLabel}`.trim();
      }
      if (closed) lines.push(closed);
    }
    if (lines.length === 0) return null;
    return (
      <div
        className="mb-8 space-y-1 rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-muted"
        role="status"
      >
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    );
  }

  return null;
}
