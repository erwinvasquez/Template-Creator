"use client";

import Link from "next/link";
import type { AccountDashboardProps } from "@shopenlinea/commerce-runtime-contract";
import { useSiteContent } from "../../lib/site-content";
import { requireUi } from "../../lib/ui";
import { withBasePath } from "../../content/resolve";

export function AccountDashboard({
  customer,
  ordersHref,
  onSignOut,
  signingOut,
  notices,
}: AccountDashboardProps) {
  const { payload, basePath } = useSiteContent();
  const account = requireUi(payload).account;
  const ordersPath = ordersHref
    ? withBasePath(basePath, ordersHref)
    : null;

  return (
    <div className="pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-2xl px-6 md:px-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
          {account.eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-wide md:text-5xl">
          {account.dashboardTitle}
        </h1>
        {notices ? <p className="mt-4 text-sm text-muted">{notices}</p> : null}

        <div className="mt-12 border border-border bg-surface p-6 md:p-8">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
            Perfil
          </h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-muted">{account.nameLabel}</dt>
              <dd className="mt-1 font-serif text-xl text-primary">
                {customer.displayName?.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{account.emailLabel}</dt>
              <dd className="mt-1 text-primary">{customer.email}</dd>
            </div>
            {customer.phone ? (
              <div>
                <dt className="text-muted">{account.phoneLabel}</dt>
                <dd className="mt-1 text-primary">{customer.phone}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          {ordersPath ? (
            <Link
              href={ordersPath}
              className="cursor-pointer border border-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-background"
            >
              Ver pedidos
            </Link>
          ) : null}
          <button
            type="button"
            disabled={signingOut}
            onClick={() => void onSignOut()}
            className="cursor-pointer bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {signingOut ? "Cerrando…" : account.logout}
          </button>
        </div>
      </div>
    </div>
  );
}
