"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type {
  CommerceTemplateCapabilities,
  ProductFilterViewModel,
  SalesMode,
} from "@shopenlinea/commerce-runtime-contract";
import {
  buildCatalogSalesModeEntryOptions,
  salesModeSwitchLinkClassName,
} from "@shopenlinea/commerce-runtime-contract";
import { useCommerceCapabilities } from "../../lib/commerce-host";
import { useSiteContent } from "../../lib/site-content";
import { requireUi } from "../../lib/ui";
import { SHOP_PATH, SHOP_QUERY, withBasePath } from "../../content/resolve";
import {
  parseSalesModeQuery,
  showsSalesModeChrome,
} from "../../lib/sales-mode";

/** Keep lab flags (dualSalesMode) and catalog filters when switching mode. */
export function modeHref(
  basePath: string,
  mode: SalesMode,
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString());
  params.set(SHOP_QUERY.salesMode, mode);
  const q = params.toString();
  return withBasePath(basePath, q ? `${SHOP_PATH}?${q}` : SHOP_PATH);
}

/**
 * Compact dual-mode switch for the shop page header (eyebrow row, right side).
 */
export function SalesModeShopSwitch() {
  const capabilities = useCommerceCapabilities();
  const { payload, basePath } = useSiteContent();
  const ui = requireUi(payload);
  const searchParams = useSearchParams();

  if (!showsSalesModeChrome(capabilities)) return null;

  const entryOptions = buildCatalogSalesModeEntryOptions(
    ui.salesMode,
    (mode) => modeHref(basePath, mode, searchParams),
  );
  if (entryOptions.length < 2) return null;

  const activeMode =
    parseSalesModeQuery(searchParams.get(SHOP_QUERY.salesMode)) ?? "stock";

  return (
    <div
      role="tablist"
      aria-label={ui.chrome.salesModeAria}
      className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 min-w-0"
    >
      {entryOptions.map((item, i) => {
        const active = activeMode === item.salesMode;
        return (
          <span key={item.salesMode} className="flex items-center gap-x-3">
            {i > 0 ? (
              <span className="select-none text-[11px] text-border" aria-hidden>
                |
              </span>
            ) : null}
            <Link
              role="tab"
              aria-selected={active}
              aria-current={active ? "page" : undefined}
              data-sales-mode-active={active ? "true" : undefined}
              href={item.href}
              className={salesModeSwitchLinkClassName(active)}
            >
              {item.label}
            </Link>
          </span>
        );
      })}
    </div>
  );
}

type NoticeProps = {
  filters: ProductFilterViewModel;
  capabilities: CommerceTemplateCapabilities;
};

/**
 * Host-only notices (prep / cerrado). No duplicate channel labels.
 */
export function SalesModeShopBanner({ filters, capabilities }: NoticeProps) {
  const { payload } = useSiteContent();
  if (!showsSalesModeChrome(capabilities)) return null;

  const salesMode = requireUi(payload).salesMode;
  if (filters.salesMode !== "madeToOrder") return null;

  const madeToOrder = salesMode.madeToOrder;
  const notices: string[] = [];
  if (filters.preparationPromiseLabel) {
    notices.push(
      `${madeToOrder.preparationLabel}: ${filters.preparationPromiseLabel}`,
    );
  }
  if (filters.madeToOrderAcceptingOrders === false) {
    let closed = madeToOrder.closedMessage;
    if (filters.madeToOrderReopensAtLabel) {
      closed = `${closed} ${madeToOrder.reopensPrefix} ${filters.madeToOrderReopensAtLabel}`.trim();
    }
    if (closed) notices.push(closed);
  }

  if (notices.length === 0) return null;

  return (
    <div className="mb-6 space-y-1 text-sm text-muted" role="status">
      {notices.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}
