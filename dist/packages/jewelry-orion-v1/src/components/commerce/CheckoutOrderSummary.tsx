"use client";

import Image from "next/image";
import type { CheckoutOrderSummaryProps } from "@shopenlinea/commerce-runtime-contract";

export function CheckoutOrderSummary({ checkout }: CheckoutOrderSummaryProps) {
  return (
    <div className="space-y-5 text-sm">
      <ul className="space-y-4">
        {checkout.lines.map((line) => (
          <li key={line.lineId} className="flex gap-3">
            <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-background">
              {line.imageUrl ? (
                <Image
                  src={line.imageUrl}
                  alt={line.productName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-base leading-tight text-primary">
                {line.productName}
              </p>
              {line.variantLabel ? (
                <p className="mt-0.5 text-xs text-muted">{line.variantLabel}</p>
              ) : null}
              <p className="mt-1 text-xs text-muted">
                {line.quantity} — {line.lineDisplayPrice}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {checkout.fulfillmentPromise ? (
        <div className="border border-border bg-background px-3 py-2 text-xs text-muted">
          {checkout.fulfillmentPromise.label}
          {checkout.fulfillmentPromise.detail
            ? ` · ${checkout.fulfillmentPromise.detail}`
            : ""}
        </div>
      ) : null}

      {checkout.appliedPromotions.map((p) => (
        <p key={p.id} className="text-xs text-cta">
          {p.label}
          {p.amountDisplay ? ` · ${p.amountDisplay}` : ""}
        </p>
      ))}

      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{checkout.totals.subtotalDisplay}</span>
        </div>
        {checkout.totals.discountDisplay ? (
          <div className="flex justify-between text-muted">
            <span>Descuento</span>
            <span>{checkout.totals.discountDisplay}</span>
          </div>
        ) : (
          <div className="flex justify-between text-muted">
            <span>Descuento</span>
            <span>—</span>
          </div>
        )}
        {checkout.totals.shippingDisplay ? (
          <div className="flex justify-between text-muted">
            <span>Envío</span>
            <span>{checkout.totals.shippingDisplay}</span>
          </div>
        ) : null}
        {checkout.totals.taxDisplay ? (
          <div className="flex justify-between text-muted">
            <span>Impuestos</span>
            <span>{checkout.totals.taxDisplay}</span>
          </div>
        ) : null}
        <div className="flex justify-between pt-2 font-medium text-primary">
          <span>Total</span>
          <span>{checkout.totals.totalDisplay}</span>
        </div>
      </div>
    </div>
  );
}
