"use client";

import Link from "next/link";
import type { MadeToOrderUpsellViewModel } from "@shopenlinea/commerce-runtime-contract";
import { withBasePath } from "../../content/resolve";
import { interpolateCount } from "@shopenlinea/commerce-runtime-contract";

type MadeToOrderUpsellDialogProps = {
  open: boolean;
  onClose: () => void;
  basePath: string;
  upsell: MadeToOrderUpsellViewModel;
  /** Max units the customer can buy for immediate fulfillment (stockCap / maxQuantity). */
  immediateFulfillmentQty: number;
  stockUpsellModalTitle: string;
  stockInsufficientImmediate: string;
  stockInsufficientMadeToOrderHint: string;
  preparationLabel: string;
  preparationPromiseLabel?: string | null;
  buyMadeToOrderCta: string;
  dismissLabel: string;
};

export function MadeToOrderUpsellDialog({
  open,
  onClose,
  basePath,
  upsell,
  immediateFulfillmentQty,
  stockUpsellModalTitle,
  stockInsufficientImmediate,
  stockInsufficientMadeToOrderHint,
  preparationLabel,
  preparationPromiseLabel,
  buyMadeToOrderCta,
  dismissLabel,
}: MadeToOrderUpsellDialogProps) {
  if (!open) return null;

  const prep =
    upsell.preparationPromiseLabel ?? preparationPromiseLabel ?? null;
  const href = withBasePath(
    basePath,
    upsell.productHref.startsWith("/")
      ? upsell.productHref
      : `/${upsell.productHref}`,
  );

  return (
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mto-upsell-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-primary/40 animate-fade-in"
        aria-label={dismissLabel}
        onClick={onClose}
      />
      <div
        className="relative mx-auto mt-[18vh] w-full max-w-md px-6 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-lg border border-border bg-background p-6 shadow-xl md:p-8">
          <p
            id="mto-upsell-title"
            className="font-serif text-xl leading-snug text-primary md:text-2xl"
          >
            {stockUpsellModalTitle}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {interpolateCount(
              stockInsufficientImmediate,
              immediateFulfillmentQty,
            )}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {stockInsufficientMadeToOrderHint}
          </p>
          {prep ? (
            <p className="mt-4 text-sm text-muted">
              {preparationLabel}: {prep}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={href}
              className="cursor-pointer bg-primary px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-colors duration-200 hover:bg-primary/90"
            >
              {buyMadeToOrderCta}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted transition-colors duration-200 hover:text-primary"
            >
              {dismissLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
