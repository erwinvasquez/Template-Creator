import type { SalesMode } from "./catalog";
import type { CommerceTemplateCapabilities } from "./capabilities";
import {
  buildCatalogSalesModeEntryOptions,
  showsDualCatalogSalesMode,
  type CatalogSalesModeUiCopy,
} from "./catalogSalesModeEntry";

export type CatalogFilterSalesModeOption = Readonly<{
  salesMode: SalesMode;
  label: string;
}>;

export function resolveCatalogFilterSalesModeOptions(
  capabilities: CommerceTemplateCapabilities | null | undefined,
  ui: CatalogSalesModeUiCopy,
): CatalogFilterSalesModeOption[] | null {
  if (!showsDualCatalogSalesMode(capabilities)) return null;
  const options = buildCatalogSalesModeEntryOptions(ui, () => "#");
  if (options.length < 2) return null;
  return options.map((opt) => ({ salesMode: opt.salesMode, label: opt.label }));
}
