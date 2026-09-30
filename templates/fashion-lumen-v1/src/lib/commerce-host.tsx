"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type {
  CartViewModel,
  CheckoutViewModel,
  CommerceRuntimeActions,
  CommerceTemplateCapabilities,
  ProductDetailViewModel,
  ProductFilterViewModel,
  ProductSearchViewModel,
} from "@shopenlinea/commerce-runtime-contract";
import { DEFAULT_PREVIEW_CAPABILITIES } from "@shopenlinea/commerce-runtime-contract";

export type LumenCommerceHost = {
  getListing: () => Promise<{
    data: ProductSearchViewModel;
    filters: ProductFilterViewModel;
  }>;
  getDetail: (slug: string) => Promise<ProductDetailViewModel | null>;
  getCart: () => Promise<CartViewModel>;
  /** Sync cart from host cache (SaaS R2). Omit in preview bridges without snapshot. */
  getCartSnapshot?: () => CartViewModel | null;
  getCheckout: () => Promise<CheckoutViewModel>;
  actions: CommerceRuntimeActions;
  subscribe: (listener: () => void) => () => void;
  isCartOpen: () => boolean;
  closeCart: () => void;
  /** Monotonic store version for sync subscriptions. */
  getStoreVersion?: () => number;
  capabilities?: CommerceTemplateCapabilities;
};

const CommerceHostContext = createContext<LumenCommerceHost | null>(null);

export function LumenCommerceProvider({
  host,
  children,
}: {
  host: LumenCommerceHost;
  children: ReactNode;
}) {
  return (
    <CommerceHostContext.Provider value={host}>
      {children}
    </CommerceHostContext.Provider>
  );
}

export function useLumenCommerceHost(): LumenCommerceHost | null {
  return useContext(CommerceHostContext);
}

export function useRequiredCommerceHost(): LumenCommerceHost {
  const host = useLumenCommerceHost();
  if (!host) {
    throw new Error(
      "LumenCommerceHost is required when cart/commerce UI is enabled",
    );
  }
  return host;
}

export function useCommerceCapabilities(): CommerceTemplateCapabilities {
  const host = useLumenCommerceHost();
  return host?.capabilities ?? DEFAULT_PREVIEW_CAPABILITIES;
}

/** Live cart snapshot subscribed to host store. */
export function useHostCart(): {
  cart: CartViewModel | null;
  openCart: () => void;
  closeCart: () => void;
  isOpen: boolean;
  actions: CommerceRuntimeActions;
  host: LumenCommerceHost;
} {
  const host = useRequiredCommerceHost();

  const isOpen = useSyncExternalStore(
    (onStoreChange) => host.subscribe(onStoreChange),
    () => host.isCartOpen(),
    () => false,
  );

  const version = useSyncExternalStore(
    (onStoreChange) => host.subscribe(onStoreChange),
    () => host.getStoreVersion?.() ?? (host.isCartOpen() ? 1 : 0),
    () => 0,
  );

  const snapshot = useSyncExternalStore(
    (onStoreChange) => host.subscribe(onStoreChange),
    () => host.getCartSnapshot?.() ?? null,
    () => null,
  );

  const [bootstrapCart, setBootstrapCart] = useState<CartViewModel | null>(
    null,
  );

  useEffect(() => {
    if (snapshot != null) return;
    let cancelled = false;
    void host.getCart().then((c) => {
      if (!cancelled) setBootstrapCart(c);
    });
    return () => {
      cancelled = true;
    };
  }, [host, version, snapshot]);

  const cart = snapshot ?? bootstrapCart;

  return {
    cart,
    isOpen,
    openCart: () => host.actions.openCartDrawer(),
    closeCart: () => host.closeCart(),
    actions: host.actions,
    host,
  };
}
