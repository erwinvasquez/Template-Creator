"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "../lib/cart-context";
import { useSiteContent } from "../lib/site-content";
import { formatPrice, withBasePath } from "../content/resolve";

export function CartDrawer() {
  const { payload, basePath } = useSiteContent();
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } =
    useCart();
  const cartUi = payload.ui?.cart;
  const { locale, currency } = payload.brand;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Estuche">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-ink/50 animate-fade-in"
        aria-label="Cerrar estuche"
        onClick={closeCart}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-xl animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-serif text-2xl tracking-wide">
            {cartUi?.title ?? "Tu selección"}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="cursor-pointer rounded-full p-2 text-secondary transition-colors duration-200 hover:bg-surface hover:text-primary"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag className="h-10 w-10 text-muted" strokeWidth={1} />
              <p className="text-sm text-muted">
                {cartUi?.empty ?? "Aún no has añadido piezas."}
              </p>
              <Link
                href={withBasePath(basePath, "/coleccion")}
                onClick={closeCart}
                className="cursor-pointer text-sm font-medium uppercase tracking-[0.14em] text-cta transition-colors duration-200 hover:text-cta-hover"
              >
                {cartUi?.exploreCta ?? "Explorar colección"}
              </Link>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li
                  key={`${item.product.id}-${item.size}-${item.metal}`}
                  className="flex gap-4"
                >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-surface">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.imageAlt}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-serif text-lg leading-tight">
                          {item.product.name}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {item.metal} · {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.product.id, item.size, item.metal)
                        }
                        className="cursor-pointer text-muted transition-colors duration-200 hover:text-primary"
                        aria-label="Eliminar"
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
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.metal,
                              item.quantity - 1,
                            )
                          }
                          aria-label="Reducir cantidad"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                        <span className="min-w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="cursor-pointer p-2 transition-colors duration-200 hover:bg-surface"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.size,
                              item.metal,
                              item.quantity + 1,
                            )
                          }
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="text-sm font-medium">
                        {formatPrice(item.product.price * item.quantity, locale, currency)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="font-serif text-xl">
                {formatPrice(subtotal, locale, currency)}
              </span>
            </div>
            <button
              type="button"
              className="w-full cursor-pointer bg-cta px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-200 hover:bg-cta-hover"
            >
              {cartUi?.checkout ?? "Finalizar compra"}
            </button>
            <p className="mt-3 text-center text-xs text-muted">
              {cartUi?.shippingHint ?? "Envío asegurado incluido"}
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
