"use client";

import { CommerceCartDrawer } from "./commerce/CommerceCartDrawer";
import { useHostCart } from "../lib/commerce-host";

export function CartDrawer() {
  const { cart, isOpen, closeCart, actions } = useHostCart();

  if (!cart) return null;

  return (
    <CommerceCartDrawer
      cart={cart}
      isOpen={isOpen}
      onClose={closeCart}
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
