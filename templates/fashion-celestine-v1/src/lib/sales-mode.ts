import type {
  CommerceTemplateCapabilities,
  SalesMode,
} from "@shopenlinea/commerce-runtime-contract";

/** Dual-mode chrome (nav / shop banner / cart mode line) — only when host says so. */
export function showsSalesModeChrome(
  capabilities: CommerceTemplateCapabilities | null | undefined,
): boolean {
  return capabilities?.salesModeSwitch === "supported";
}

export function parseSalesModeQuery(
  value: string | null | undefined,
): SalesMode | null {
  if (value === "stock" || value === "madeToOrder") return value;
  return null;
}

export type SalesModeUiCopy = {
  stock?: {
    navLabel?: string;
    shopBanner?: string;
    cartLabel?: string;
  };
  madeToOrder?: {
    navLabel?: string;
    shopBanner?: string;
    preparationLabel?: string;
    closedMessage?: string;
    reopensPrefix?: string;
    cartLabel?: string;
    cartClosedWarning?: string;
  };
  nav?: Array<{
    salesMode: SalesMode;
    label: string;
    href: string;
  }>;
};

export function cartSalesModeLabel(
  salesMode: SalesMode,
  ui: SalesModeUiCopy | undefined,
): string {
  if (salesMode === "madeToOrder") {
    return ui?.madeToOrder?.cartLabel ?? "Compra bajo pedido";
  }
  return ui?.stock?.cartLabel ?? "Compra con entrega inmediata";
}
