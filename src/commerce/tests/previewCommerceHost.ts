import type { CommerceRuntimeActions } from "@shopenlinea/commerce-runtime-contract";

/** Host mínimo para montar PDP en tests. La vista solo lee el retorno a la tienda. */
export function previewCommerceHost(): never {
  const actions = {
    setCatalogFilters: () => {},
    loadMoreProducts: async () => {
      throw new Error("unused");
    },
    selectVariant: () => {},
    addToCart: async () => ({ ok: true as const }),
    openCartDrawer: () => {},
    confirmAddToCartSuccess: () => {},
  } as CommerceRuntimeActions;

  return {
    getListing: async () => {
      throw new Error("unused");
    },
    getDetail: async () => null,
    getCart: async () => {
      throw new Error("unused");
    },
    getCheckout: async () => {
      throw new Error("unused");
    },
    actions,
    subscribe: () => () => {},
    isCartOpen: () => false,
    closeCart: () => {},
    getPlpReturnHref: () => null,
  } as never;
}
