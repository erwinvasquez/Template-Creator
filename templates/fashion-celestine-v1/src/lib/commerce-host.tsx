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

export type CelestineCommerceHost = {
  getListing: () => Promise<{
    data: ProductSearchViewModel;
    filters: ProductFilterViewModel;
  }>;
  getDetail: (slug: string) => Promise<ProductDetailViewModel | null>;
  getCart: () => Promise<CartViewModel>;
  getCheckout: () => Promise<CheckoutViewModel>;
  actions: CommerceRuntimeActions;
  subscribe: (listener: () => void) => () => void;
  isCartOpen: () => boolean;
  closeCart: () => void;
  /** Monotonic store version for sync subscriptions. */
  getStoreVersion?: () => number;
  capabilities?: CommerceTemplateCapabilities;
};

const CommerceHostContext = createContext<CelestineCommerceHost | null>(null);

export function CelestineCommerceProvider({
  host,
  children,
}: {
  host: CelestineCommerceHost;
  children: ReactNode;
}) {
  return (
    <CommerceHostContext.Provider value={host}>
      {children}
    </CommerceHostContext.Provider>
  );
}

export function useCelestineCommerceHost(): CelestineCommerceHost | null {
  return useContext(CommerceHostContext);
}

export function useRequiredCommerceHost(): CelestineCommerceHost {
  const host = useCelestineCommerceHost();
  if (!host) {
    throw new Error(
      "CelestineCommerceHost is required when cart/commerce UI is enabled",
    );
  }
  return host;
}

export function useCommerceCapabilities(): CommerceTemplateCapabilities {
  const host = useCelestineCommerceHost();
  return host?.capabilities ?? DEFAULT_PREVIEW_CAPABILITIES;
}

/** Live cart snapshot subscribed to host store. */
export function useHostCart(): {
  cart: CartViewModel | null;
  openCart: () => void;
  closeCart: () => void;
  isOpen: boolean;
  actions: CommerceRuntimeActions;
  host: CelestineCommerceHost;
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

  const [cart, setCart] = useState<CartViewModel | null>(null);

  useEffect(() => {
    let cancelled = false;
    void host.getCart().then((c) => {
      if (!cancelled) setCart(c);
    });
    return () => {
      cancelled = true;
    };
  }, [host, version, isOpen]);

  return {
    cart,
    isOpen,
    openCart: () => host.actions.openCartDrawer(),
    closeCart: () => host.closeCart(),
    actions: host.actions,
    host,
  };
}
