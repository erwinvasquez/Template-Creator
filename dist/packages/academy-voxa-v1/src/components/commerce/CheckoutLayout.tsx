"use client";

import type { HostCheckoutLayoutProps } from "@shopenlinea/commerce-runtime-contract";
import {
  hostCheckoutLayoutActionsClassName,
  hostCheckoutLayoutAsideClassName,
  hostCheckoutLayoutFormColumnClassName,
  hostCheckoutLayoutGridClassName,
  hostCheckoutLayoutNoticesClassName,
  hostCheckoutLayoutPageInnerClassName,
  hostCheckoutLayoutSectionClassName,
  hostCheckoutLayoutSummaryInnerClassName,
} from "@shopenlinea/commerce-runtime-contract";

/** Layout shell for host-owned checkout — paint only; labels from SaaS i18n. */
export function CheckoutLayout({
  labels,
  customerForm,
  shippingSelector,
  paymentSelector,
  orderSummary,
  notices,
  actions,
}: HostCheckoutLayoutProps) {
  return (
    <div className="pb-24 pt-12 md:pt-16">
      <div className={`${hostCheckoutLayoutPageInnerClassName} px-6 md:px-10`}>
        <h1 className="font-serif text-4xl tracking-wide md:text-5xl">
          {labels.pageTitle}
        </h1>
        {notices ? <div className={hostCheckoutLayoutNoticesClassName}>{notices}</div> : null}
        <div className={hostCheckoutLayoutGridClassName}>
          <div className={hostCheckoutLayoutFormColumnClassName}>
            <section className={hostCheckoutLayoutSectionClassName}>
              <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
                {labels.customerSection}
              </h2>
              {customerForm}
            </section>
            {shippingSelector ? (
              <section className={hostCheckoutLayoutSectionClassName}>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
                  {labels.shippingSection}
                </h2>
                {shippingSelector}
              </section>
            ) : null}
            <section className={hostCheckoutLayoutSectionClassName}>
              <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary">
                {labels.paymentSection}
              </h2>
              {paymentSelector}
            </section>
            <div className={hostCheckoutLayoutActionsClassName}>{actions}</div>
          </div>
          <aside className={hostCheckoutLayoutAsideClassName}>
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
              {labels.summarySection}
            </h2>
            <div className={hostCheckoutLayoutSummaryInnerClassName}>{orderSummary}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
