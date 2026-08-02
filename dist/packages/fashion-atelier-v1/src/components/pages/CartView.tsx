"use client";

import { CartPageView } from "../commerce/CartPageView";
import { useHostCart } from "../../lib/commerce-host";

export function CartView() {
  const { cart, actions } = useHostCart();

  if (!cart) {
    return (
      <p className="px-6 py-32 text-center text-muted md:px-8">Cargando…</p>
    );
  }

  return (
    <CartPageView
      cart={cart}
      actions={{
        updateCartQuantity: actions.updateCartQuantity,
        removeCartLine: actions.removeCartLine,
        clearCart: actions.clearCart,
        navigateToCheckout: actions.navigateToCheckout,
        openCartDrawer: actions.openCartDrawer,
      }}
    />
  );
}
