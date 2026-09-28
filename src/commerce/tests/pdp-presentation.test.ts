import { describe, expect, it } from "vitest";
import { isPdpFieldVisible } from "../../../templates/fashion-atelier-v1/src/lib/pdp-presentation";

describe("isPdpFieldVisible", () => {
  it("shows all fields when presentation is undefined", () => {
    expect(isPdpFieldVisible(undefined, "shortDescription")).toBe(true);
    expect(isPdpFieldVisible(undefined, "relatedProducts")).toBe(true);
  });

  it("hides field when explicitly false", () => {
    expect(
      isPdpFieldVisible({ shortDescription: false }, "shortDescription"),
    ).toBe(false);
    expect(
      isPdpFieldVisible({ shortDescription: false }, "description"),
    ).toBe(true);
  });
});
