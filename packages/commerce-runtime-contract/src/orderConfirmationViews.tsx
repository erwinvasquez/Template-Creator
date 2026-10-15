"use client";

import type { OrderConfirmationViewProps } from "./template-views";
import {
  commerceLineItemCompareAtClassName,
  commerceLineItemFinalPriceClassName,
  commerceLineItemHeaderRowClassName,
  commerceLineItemImageBorderClassName,
  commerceLineItemImageShellClassName,
  commerceLineItemListClassName,
  commerceLineItemPriceColumnClassName,
  commerceLineItemQuantityClassName,
  commerceLineItemRowClassName,
  commerceLineItemTitleClassName,
  commerceLineItemVariantClassName,
} from "./commerceLineItemPresentation";
import { buildOrderConfirmationSummaryRows } from "./orderConfirmationPresentation";

export function OrderConfirmationStandardView({
  order,
  summaryLabels,
  actions,
}: OrderConfirmationViewProps) {
  const summaryRows = buildOrderConfirmationSummaryRows(order.totals, summaryLabels);

  return (
    <div className="pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-2xl px-6 md:px-8">
        <h1 className="font-serif text-4xl tracking-wide text-foreground md:text-5xl">
          Pedido confirmado
        </h1>
        <p className="mt-4 text-sm text-muted">
          {order.message ?? `Pedido ${order.orderId} · ${order.statusLabel}`}
        </p>
        <ul className={`mt-10 border-t border-border pt-8 ${commerceLineItemListClassName}`}>
          {order.lines.map((line) => (
            <li key={line.lineId} className={commerceLineItemRowClassName}>
              <div
                className={`${commerceLineItemImageShellClassName} ${commerceLineItemImageBorderClassName}`}
              >
                {line.imageUrl ? (
                  <img
                    src={line.imageUrl}
                    alt={line.productName}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className={commerceLineItemHeaderRowClassName}>
                  <div className="min-w-0 flex-1">
                    <p className={commerceLineItemTitleClassName}>{line.productName}</p>
                    {line.variantLabel ? (
                      <p className={commerceLineItemVariantClassName}>{line.variantLabel}</p>
                    ) : null}
                    <p className={commerceLineItemQuantityClassName}>× {line.quantity}</p>
                {summaryLabels.kitIncludes && line.kitIncludes && line.kitIncludes.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                      {summaryLabels.kitIncludes}
                    </p>
                        <ul className="mt-2 space-y-2">
                          {line.kitIncludes.map((include) => {
                            const [name, ...rest] = include.label.split(" — ");
                            const detail = rest.join(" — ");
                            return (
                              <li key={`${include.label}-${include.quantity}`}>
                                <span className="block">{name}</span>
                                <span className="block text-muted">
                                  {detail
                                    ? `${detail} × ${include.quantity}`
                                    : `× ${include.quantity}`}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                  <div className={commerceLineItemPriceColumnClassName}>
                    {line.compareAtDisplay ? (
                      <p className={commerceLineItemCompareAtClassName}>{line.compareAtDisplay}</p>
                    ) : null}
                    <p className={commerceLineItemFinalPriceClassName}>{line.lineDisplayPrice}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
          {summaryRows.map((row) => (
            <div
              key={row.key}
              className={`flex justify-between gap-3 ${
                row.emphasize ? "pt-2 text-base font-semibold" : ""
              }`}
            >
              <span
                className={
                  row.successAccent
                    ? "text-success-accent"
                    : row.muted
                      ? "text-muted"
                      : "text-foreground"
                }
              >
                {row.label}
              </span>
              <span
                className={`shrink-0 tabular-nums ${
                  row.successAccent ? "font-medium text-success-accent" : ""
                } ${row.emphasize ? "font-semibold" : ""}`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <a
            href={actions.trackingHref}
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-2.5 text-center text-sm font-medium text-primary-foreground sm:w-auto"
          >
            {actions.trackingLabel}
          </a>
          <a
            href={actions.continueShoppingHref}
            className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background px-5 py-2.5 text-center text-sm font-medium text-foreground sm:w-auto"
          >
            {actions.continueShoppingLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
