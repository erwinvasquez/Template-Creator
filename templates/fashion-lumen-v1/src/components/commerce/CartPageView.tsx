"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import type { CartViewProps } from "@shopenlinea/commerce-runtime-contract";
import { useCommerceCapabilities } from "../../lib/commerce-host";
import { useSiteContent } from "../../lib/site-content";
import { requireUi } from "../../lib/ui";
import { withBasePath } from "../../content/resolve";
import { cartSalesModeLabel, showsSalesModeChrome } from "../../lib/sales-mode";

function lineMaxQty(maxQuantity: number | null | undefined): number {
  return maxQuantity ?? Number.POSITIVE_INFINITY;
}

/** Full-page cart — same contract as CartDrawer (`CartViewProps`). */
export function CartPageView({ cart, actions }: CartViewProps) {
  const { payload, basePath } = useSiteContent();
  const ui = requireUi(payload);
  const cartUi = ui.cart;
  const capabilities = useCommerceCapabilities();
  const showSalesModeChrome = showsSalesModeChrome(capabilities);
  const salesModeLine =
    showSalesModeChrome && cart.lines.length > 0
      ? cartSalesModeLabel(cart.salesMode, ui.salesMode)
      : null;
  const cartClosedWarning =
    showSalesModeChrome &&
    cart.salesMode === "madeToOrder" &&
    cart.madeToOrderAcceptingOrders === false
      ? ui.salesMode.madeToOrder.cartClosedWarning
      : null;

  return (
    <div className="pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-3xl px-6 md:px-8">
        <h1 className="font-serif text-4xl tracking-wide md:text-5xl">
          {cartUi.title}
        </h1>

        {cart.lines.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <ShoppingBag className="h-12 w-12 text-muted" strokeWidth={1} />
            <p className="text-sm text-muted">{cartUi.empty}</p>
            <Link
              href={withBasePath(basePath, "/tienda")}
              className="cursor-pointer text-sm font-medium uppercase tracking-[0.14em] text-cta transition-colors duration-200 hover:text-cta-hover"
            >
              {cartUi.exploreCta}
            </Link>
          </div>
        ) : (
          <>
            {salesModeLine ? (
              <p className="mt-6 text-xs text-muted">{salesModeLine}</p>
            ) : null}
            <ul className="mt-12 space-y-8">
              {cart.lines.map((line) => (
                <li
                  key={line.lineId}
                  className="flex gap-4 border-b border-border pb-8"
                >
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden bg-surface">
                    {line.imageUrl && (
                      <Image
                        src={line.imageUrl}
                        alt={line.productName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-serif text-xl leading-tight">
                          {line.productName}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {line.variantLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => actions.removeCartLine(line.variantId)}
                        className="cursor-pointer text-muted transition-colors duration-200 hover:text-primary"
                        aria-label="Eliminar"
                      >
                        <X className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          className="cursor-pointer p-2 transition-colors duration-200 hover:bg-surface"
                          onClick={() =>
                            actions.updateCartQuantity(
                              line.variantId,
                              Math.max(1, line.quantity - 1),
                            )
                          }
                          aria-label="Menos"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <span className="w-8 text-center text-sm">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="cursor-pointer p-2 transition-colors duration-200 hover:bg-surface"
                          onClick={() =>
                            actions.updateCartQuantity(
                              line.variantId,
                              Math.min(
                                lineMaxQty(line.maxQuantity),
                                line.quantity + 1,
                              ),
                            )
                          }
                          aria-label="Más"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="text-sm font-medium">
                        {line.lineDisplayPrice}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-border pt-6">
              {cart.promotionLabels?.map((p) => (
                <p key={p} className="mb-2 text-xs text-cta">
                  {p}
                </p>
              ))}
              <div className="mb-6 flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-serif text-2xl">{cart.subtotalDisplay}</span>
              </div>
              {cartClosedWarning ? (
                <p className="mb-4 text-sm text-muted" role="status">
                  {cartClosedWarning}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => actions.navigateToCheckout()}
                  className="cursor-pointer bg-cta px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-200 hover:bg-cta-hover"
                >
                  {cartUi.checkout}
                </button>
                <button
                  type="button"
                  onClick={() => actions.clearCart()}
                  className="cursor-pointer px-4 py-3.5 text-xs uppercase tracking-[0.14em] text-muted transition-colors duration-200 hover:text-primary"
                >
                  Vaciar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
