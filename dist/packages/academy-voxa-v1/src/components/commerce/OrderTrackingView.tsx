"use client";

import Image from "next/image";
import Link from "next/link";
import type { OrderTrackingViewProps } from "@shopenlinea/commerce-runtime-contract";

function MilestoneDot({
  state,
}: {
  state: "done" | "current" | "pending" | "error";
}) {
  const base = "mt-1 h-2.5 w-2.5 shrink-0 rounded-full";
  if (state === "done") return <span className={`${base} bg-primary`} />;
  if (state === "error") return <span className={`${base} bg-danger`} />;
  if (state === "current")
    return <span className={`${base} bg-primary ring-2 ring-primary/30`} />;
  return <span className={`${base} bg-border`} />;
}

/** Public order tracking — host supplies labels via viewModel; layout matches Cart / Confirmation. */
export function OrderTrackingView({ tracking }: OrderTrackingViewProps) {
  const {
    orderNumber,
    orgName,
    placedAtDisplay,
    statusHeadline,
    statusDescription,
    statusSummaryLabel,
    isOrderCancelled,
    cancelledBanner,
    milestones,
    lines,
    shipping,
    totals,
    payment,
    appliedCouponCode,
    appliedPromotionLabel,
    continueHref,
    continueLabel,
    contactHref,
    contactLabel,
    labels,
  } = tracking;

  const shippingTitle = shipping?.isPickup
    ? labels.pickupSectionTitle
    : labels.shippingSectionTitle;

  return (
    <div className="pb-24 pt-12 md:pt-16">
      <div className="mx-auto max-w-2xl px-6 md:px-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
          {orgName}
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-wide text-primary md:text-5xl">
          {statusHeadline}
        </h1>
        {statusDescription ? (
          <p className="mt-4 text-sm text-muted">{statusDescription}</p>
        ) : null}

        <dl className="mt-8 space-y-2 text-sm">
          <div>
            <dt className="text-muted">{labels.orderNumberLabel}</dt>
            <dd className="font-mono font-medium text-primary">{orderNumber}</dd>
          </div>
          <div>
            <dt className="text-muted">{labels.placedAtLabel}</dt>
            <dd>{placedAtDisplay}</dd>
          </div>
          <div>
            <dt className="text-muted">{labels.statusLabel}</dt>
            <dd className="font-medium text-primary">{statusSummaryLabel}</dd>
          </div>
        </dl>

        {isOrderCancelled && cancelledBanner ? (
          <p className="mt-6 border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
            {cancelledBanner}
          </p>
        ) : null}

        {milestones.length > 0 ? (
          <div className="mt-10 border-t border-border pt-8">
            <ul className="space-y-4">
              {milestones.map((milestone) => (
                <li key={milestone.id} className="flex gap-3 text-sm">
                  <MilestoneDot state={milestone.state} />
                  <div>
                    <p className="font-medium text-primary">{milestone.label}</p>
                    {milestone.subLabel ? (
                      <p className="text-muted">{milestone.subLabel}</p>
                    ) : null}
                    {milestone.occurredAtDisplay ? (
                      <p className="text-xs text-muted">{milestone.occurredAtDisplay}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {shipping ? (
          <div className="mt-10 border-t border-border pt-8">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
              {shippingTitle}
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              {shipping.methodName ? (
                <div>
                  <dt className="text-muted">{labels.methodNameLabel}</dt>
                  <dd>{shipping.methodName}</dd>
                </div>
              ) : null}
              {shipping.isPickup && shipping.pickupBranchName ? (
                <div>
                  <dt className="text-muted">{labels.pickupBranchLabel}</dt>
                  <dd>{shipping.pickupBranchName}</dd>
                </div>
              ) : null}
              {shipping.addressLine1 ? (
                <div>
                  <dt className="text-muted">{labels.addressLabel}</dt>
                  <dd>
                    {shipping.addressLine1}
                    {shipping.locality ? `, ${shipping.locality}` : ""}
                    {shipping.adminAreaLevel1Name
                      ? `, ${shipping.adminAreaLevel1Name}`
                      : ""}
                  </dd>
                </div>
              ) : null}
              {shipping.trackingNumber ? (
                <div>
                  <dt className="text-muted">{labels.trackingCodeLabel}</dt>
                  <dd className="font-mono">{shipping.trackingNumber}</dd>
                </div>
              ) : null}
              {shipping.carrierName ? (
                <div>
                  <dt className="text-muted">{labels.carrierLabel}</dt>
                  <dd>{shipping.carrierName}</dd>
                </div>
              ) : null}
            </dl>
            {shipping.fulfillmentPromiseText ? (
              <p className="mt-4 text-sm text-muted">{shipping.fulfillmentPromiseText}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-10 border-t border-border pt-8">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
            {labels.summarySectionTitle}
          </h2>
          <ul className="mt-4 space-y-4 text-sm">
            {lines.map((line) => (
              <li
                key={line.lineId}
                className="grid grid-cols-[auto_1fr] gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-border bg-surface">
                  {line.imageUrl ? (
                    <Image
                      src={line.imageUrl}
                      alt={line.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-1 text-center text-[10px] leading-tight text-muted">
                      {labels.imagePlaceholder}
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-primary">{line.productName}</p>
                    {line.variantLabel ? (
                      <p className="mt-0.5 text-xs text-muted">{line.variantLabel}</p>
                    ) : null}
                    <p className="mt-1 text-muted">
                      {labels.unitPriceLabel}: {line.unitDisplayPrice}
                      <span> × {line.quantity}</span>
                    </p>
                  </div>
                  <span className="shrink-0 font-medium">{line.lineDisplayPrice}</span>
                </div>
              </li>
            ))}
          </ul>
          {appliedCouponCode || appliedPromotionLabel ? (
            <p className="mt-4 text-xs text-muted">
              {appliedCouponCode
                ? `${labels.appliedCodeLabel}: ${appliedCouponCode}`
                : null}
              {appliedPromotionLabel
                ? `${labels.appliedPromotionLabel}: ${appliedPromotionLabel}`
                : null}
            </p>
          ) : null}
        </div>

        <div className="mt-8 border-t border-border pt-6 text-sm">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
            {labels.totalsSectionTitle}
          </h2>
          <dl className="mt-4 space-y-1">
            <div className="flex justify-between">
              <dt className="text-muted">{labels.subtotalLabel}</dt>
              <dd>{totals.subtotalDisplay}</dd>
            </div>
            {totals.discountDisplay ? (
              <div className="flex justify-between">
                <dt className="text-muted">{labels.discountLabel}</dt>
                <dd>{totals.discountDisplay}</dd>
              </div>
            ) : null}
            {totals.shippingDisplay ? (
              <div className="flex justify-between">
                <dt className="text-muted">{labels.shippingLabel}</dt>
                <dd>{totals.shippingDisplay}</dd>
              </div>
            ) : null}
            {totals.taxDisplay ? (
              <div className="flex justify-between">
                <dt className="text-muted">{labels.taxLabel}</dt>
                <dd>{totals.taxDisplay}</dd>
              </div>
            ) : null}
            <div className="flex justify-between pt-2 font-medium">
              <dt>{labels.totalLabel}</dt>
              <dd>{totals.totalDisplay}</dd>
            </div>
            {totals.paidDisplay ? (
              <div className="flex justify-between">
                <dt className="text-muted">{labels.paidLabel}</dt>
                <dd>{totals.paidDisplay}</dd>
              </div>
            ) : null}
            {totals.dueDisplay ? (
              <div className="flex justify-between">
                <dt className="text-muted">{labels.dueLabel}</dt>
                <dd>{totals.dueDisplay}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {payment ? (
          <div className="mt-8 border-t border-border pt-6 text-sm">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
              {labels.paymentSectionTitle}
            </h2>
            <dl className="mt-4 space-y-1">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{labels.paymentStatusFieldLabel}</dt>
                <dd>{payment.statusLabel}</dd>
              </div>
              {payment.methodLabel ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{labels.paymentMethodFieldLabel}</dt>
                  <dd>{payment.methodLabel}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{labels.totalFieldLabel}</dt>
                <dd>{payment.totalDisplay}</dd>
              </div>
            </dl>
            {payment.instructions ? (
              <div className="mt-4">
                <p className="text-muted">{payment.instructionsTitle}</p>
                <p className="mt-1">{payment.instructions}</p>
              </div>
            ) : null}
            {payment.voucherMessage ? (
              <p className="mt-4 text-muted">{payment.voucherMessage}</p>
            ) : null}
            {payment.voucherViewUrl && payment.voucherViewLabel ? (
              <a
                href={payment.voucherViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-primary underline-offset-2 transition-colors hover:text-secondary hover:underline"
              >
                {payment.voucherViewLabel}
              </a>
            ) : null}
            {payment.stripePendingMessage ? (
              <p className="mt-4 text-muted">{payment.stripePendingMessage}</p>
            ) : null}
            {payment.failedMessage ? (
              <p className="mt-4 text-danger">{payment.failedMessage}</p>
            ) : null}
            {payment.supportHint ? (
              <p className="mt-2 text-muted">{payment.supportHint}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-10 border-t border-border pt-8">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
            {labels.helpSectionTitle}
          </h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link
              href={continueHref}
              className="cursor-pointer border border-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors duration-200 hover:bg-primary hover:text-background"
            >
              {continueLabel}
            </Link>
            {contactHref && contactLabel ? (
              <a
                href={contactHref}
                className="cursor-pointer px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted underline-offset-2 transition-colors hover:text-primary hover:underline"
              >
                {contactLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
