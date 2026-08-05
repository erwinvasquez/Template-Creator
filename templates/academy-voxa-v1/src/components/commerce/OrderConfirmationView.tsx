"use client";

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
        <ul className="mt-10 space-y-3 border-t border-border pt-8 text-sm">
          {order.lines.map((l) => (
            <li key={l.lineId} className="flex justify-between gap-4">
              <span>
                {l.productName} × {l.quantity}
              </span>
              <span>{l.lineDisplayPrice}</span>
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
