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

export function CommerceCartDrawer({
  cart,
  actions,
  isOpen,
  onClose,
}: CartViewProps) {
  const { payload, basePath } = useSiteContent();
  const ui = requireUi(payload);
  const cartUi = ui.cart;
  const checkoutUi = ui.checkout;
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label={cartUi.title}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-ink/50 animate-fade-in"
        aria-label={cartUi.title}
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-serif text-2xl tracking-wide">{cartUi.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-secondary transition-colors duration-200 hover:bg-surface hover:text-primary"
            aria-label={ui.chrome.closeMenu}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag className="h-10 w-10 text-muted" strokeWidth={1} />
              <p className="text-sm text-muted">{cartUi.empty}</p>
              <Link
                href={withBasePath(basePath, "/coleccion")}
                onClick={onClose}
                className="cursor-pointer text-sm font-medium uppercase tracking-[0.14em] text-primary transition-colors duration-200 hover:text-secondary"
              >
                {cartUi.exploreCta}
              </Link>
            </div>
          ) : (
            <>
              {salesModeLine ? (
                <p className="mb-4 text-xs text-muted">{salesModeLine}</p>
              ) : null}
              <ul className="space-y-6">
              {cart.lines.map((line) => (
                <li key={line.lineId} className="flex gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-surface">
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
                        <p className="font-serif text-lg leading-tight">
                          {line.productName}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {line.variantLabel}
                        </p>
                        {line.errorMessage && (
                          <p className="mt-1 text-xs text-red-700">
                            {line.errorMessage}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => actions.removeCartLine(line.variantId)}
                        className="cursor-pointer text-muted transition-colors duration-200 hover:text-primary"
                        aria-label={checkoutUi.removeLineLabel}
                      >
                        <X className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
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
                          aria-label={checkoutUi.quantityLabel}
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
                          aria-label={checkoutUi.quantityLabel}
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
            </>
          )}
        </div>

        {cart.lines.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            {cart.promotionLabels?.map((p) => (
              <p key={p} className="mb-2 text-xs text-primary">
                {p}
              </p>
            ))}
            <div className="mb-4 flex justify-between text-sm">
              <span className="text-muted">{checkoutUi.subtotalLabel}</span>
              <span className="font-serif text-xl">{cart.subtotalDisplay}</span>
            </div>
            {cartClosedWarning ? (
              <p className="mb-4 text-sm text-muted" role="status">
                {cartClosedWarning}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => actions.navigateToCheckout()}
              className="w-full cursor-pointer bg-primary px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-background transition-colors duration-200 hover:bg-primary/90"
            >
              {cartUi.checkout}
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              {cartUi.shippingHint}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
