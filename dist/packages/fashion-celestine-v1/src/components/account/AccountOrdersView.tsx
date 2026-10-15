"use client";

import Link from "next/link";
import type { AccountOrdersViewProps } from "@shopenlinea/commerce-runtime-contract";

export function AccountOrdersView({ orders }: AccountOrdersViewProps) {
  const { orders: rows, emptyMessage } = orders;

  return (
    <div className="pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-2xl px-6 md:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
          Mi cuenta
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-wide md:text-5xl">
          Mis pedidos
        </h1>

        {rows.length === 0 ? (
          <p className="mt-8 text-sm text-muted">{emptyMessage ?? "Sin pedidos"}</p>
        ) : (
          <ul className="mt-10 space-y-4">
            {rows.map((row) => (
              <li
                key={row.orderId}
                className="border border-border bg-surface p-6 text-sm md:p-8"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-mono text-primary">{row.orderNumber}</p>
                    <p className="text-muted">{row.placedAtDisplay}</p>
                    <p>{row.statusLabel}</p>
                  </div>
                  <p className="font-medium">{row.totalDisplay}</p>
                </div>
                {row.trackingHref ? (
                  <Link
                    href={row.trackingHref}
                    className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-primary hover:underline"
                  >
                    {row.trackingLabel ?? "Ver seguimiento"}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
