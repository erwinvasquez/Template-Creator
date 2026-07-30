import { describe, expect, it } from "vitest";
import { createMockCommerceBridge } from "../mock/createMockCommerceBridge";

describe("createMockCommerceBridge", () => {
  it("returns nextCursor for catalog-default first page", async () => {
    const bridge = createMockCommerceBridge("catalog-default");
    const { data } = await bridge.getProductListing({});
    expect(data.products.length).toBeGreaterThan(0);
    expect(data.nextCursor).toBeTruthy();
  });

  it("cart-promotion exposes labels without cost fields on cart", async () => {
    const bridge = createMockCommerceBridge("cart-promotion");
    const cart = await bridge.getCart();
    expect(cart.promotionLabels?.length).toBeGreaterThan(0);
    expect(cart).not.toHaveProperty("tax");
    expect(cart).not.toHaveProperty("shippingCost");
    expect(cart.lines[0]).not.toHaveProperty("unitCost");
  });

  it("catalog-empty has no products and null cursor", async () => {
    const bridge = createMockCommerceBridge("catalog-empty");
    const { data } = await bridge.getProductListing({});
    expect(data.products).toHaveLength(0);
    expect(data.nextCursor).toBeNull();
  });
});
