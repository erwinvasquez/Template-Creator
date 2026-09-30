import type {
  CommerceTemplateCapabilities,
  SalesMode,
} from "@shopenlinea/commerce-runtime-contract";
import type { TemplateUi } from "../content/types";

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

export type SalesModeUiCopy = TemplateUi["salesMode"];

export function cartSalesModeLabel(
  salesMode: SalesMode,
  ui: SalesModeUiCopy,
): string {
  if (salesMode === "madeToOrder") {
    return ui.madeToOrder.cartLabel;
  }
  return ui.stock.cartLabel;
}
