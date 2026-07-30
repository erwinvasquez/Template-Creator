"use client";

import { useMemo } from "react";
import {
  DEFAULT_PREVIEW_CAPABILITIES,
  type CartViewModel,
  type CheckoutViewModel,
  type CommerceRuntimeActions,
  type CommerceTemplateCapabilities,
  type ProductDetailViewModel,
  type ProductFilterViewModel,
  type ProductSearchViewModel,
} from "@shopenlinea/commerce-runtime-contract";
import { createMockCommerceBridge } from "@/commerce/mock";
import type { MockCommerceBridgeOptions } from "@/commerce/mock";
import type { CommerceFixtureId } from "@/commerce/fixtures/ids";
import { parseCommerceFixture } from "@/commerce/fixtures/ids";

/**
 * Shape shared by every template commerce host (Atelier's `AtelierCommerceHost`,
 * Orion's `OrionCommerceHost`). Structural typing keeps the lab host reusable
 * without importing from a specific template package.
 */
export type LabCommerceHost = {
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
  getStoreVersion?: () => number;
  capabilities?: CommerceTemplateCapabilities;
};

/**
 * Mock Bridge host for lab. Pass a fixture id (e.g. from `?commerce=`) to enable;
 * `null` / empty → no mock (caller should fall back to payload bridge).
 */
export function useLabCommerceHost(
  fixtureParam: string | null | undefined,
  options: MockCommerceBridgeOptions = {},
): LabCommerceHost | null {
  const enabled = Boolean(fixtureParam && fixtureParam.trim());
  const fixtureId = enabled
    ? parseCommerceFixture(fixtureParam)
    : "catalog-default";
  const { shopPath, checkoutHref } = options;

  return useMemo(() => {
    if (!enabled) return null;
    const bridge = createMockCommerceBridge(fixtureId, {
      shopPath,
      checkoutHref,
    });
    const host: LabCommerceHost = {
      getListing: () => bridge.getProductListing({}),
      getDetail: (slug) => bridge.getProductDetail(slug),
      getCart: () => bridge.getCart(),
      getCheckout: () =>
        bridge.getCheckout?.() ??
        Promise.reject(new Error("getCheckout unavailable")),
      actions: bridge.actions,
      subscribe: bridge.subscribe,
      isCartOpen: bridge.isCartDrawerOpen,
      closeCart: bridge.closeCartDrawer,
      getStoreVersion: bridge.getStoreVersion,
      capabilities: DEFAULT_PREVIEW_CAPABILITIES,
    };
    return host;
  }, [enabled, fixtureId, shopPath, checkoutHref]);
}

export type { CommerceFixtureId };
