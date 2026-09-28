"use client";

import Image from "next/image";
import type { OrderConfirmationViewProps } from "@shopenlinea/commerce-runtime-contract";

export function OrderConfirmationView({ order }: OrderConfirmationViewProps) {
  return (
    <div className="pb-24 pt-12 md:pt-16">
      <div className="mx-auto max-w-2xl px-6 md:px-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
          Pedido confirmado
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-wide md:text-5xl">
          Gracias
        </h1>
        <p className="mt-4 text-sm text-muted">
          {order.message ?? `Pedido ${order.orderId} · ${order.statusLabel}`}
        </p>
        <ul className="mt-10 space-y-4 border-t border-border pt-8 text-sm">
          {order.lines.map((l) => (
            <li
              key={l.lineId}
              className="grid grid-cols-[auto_1fr] gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-border bg-surface">
                {l.imageUrl ? (
                  <Image
                    src={l.imageUrl}
                    alt={l.productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : null}
              </div>
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-serif text-base leading-tight text-primary">
                    {l.productName}
                  </p>
                  {l.variantLabel ? (
                    <p className="mt-0.5 text-xs text-muted">{l.variantLabel}</p>
                  ) : null}
                  <p className="mt-1 text-muted">× {l.quantity}</p>
                </div>
                <span className="shrink-0 font-medium">{l.lineDisplayPrice}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-between border-t border-border pt-4 font-medium">
          <span>Total</span>
          <span>{order.totals.totalDisplay}</span>
        </div>
      </div>
    </div>
  );
}
