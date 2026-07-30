"use client";

import type { CheckoutLayoutProps } from "@shopenlinea/commerce-runtime-contract";

/**
 * @deprecated Prefer {@link CheckoutPage}. Kept for hosts that still inject ReactNode slots.
 * New integrations must use typed checkout components, not host-drawn inputs.
 */
export function CheckoutLayout({
  customerForm,
  shippingSelector,
  paymentSelector,
  orderSummary,
  notices,
  actions,
}: CheckoutLayoutProps) {
  return (
    <div className="pb-24 pt-12 md:pt-16">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <h1 className="font-serif text-4xl tracking-wide md:text-5xl">
          Checkout
        </h1>
        {notices ? <div className="mt-6">{notices}</div> : null}
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-10">
            <section className="space-y-4">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta">
                Cliente
              </h2>
              {customerForm}
            </section>
            {shippingSelector ? (
              <section className="space-y-4">
                <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta">
                  Envío
                </h2>
                {shippingSelector}
              </section>
            ) : null}
            <section className="space-y-4">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta">
                Pago
              </h2>
              {paymentSelector}
            </section>
            <div>{actions}</div>
          </div>
          <aside className="border border-border bg-surface p-6 md:p-8">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
              Resumen
            </h2>
            <div className="mt-6">{orderSummary}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
