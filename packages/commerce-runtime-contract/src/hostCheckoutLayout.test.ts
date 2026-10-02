import { describe, expect, it } from "vitest";

import {
  hostCheckoutContainWidthClassName,
  hostCheckoutLayoutFormColumnClassName,
  hostCheckoutLayoutGridClassName,
  hostCheckoutLayoutPageInnerClassName,
  hostCheckoutLineItemRowClassName,
  hostCheckoutLineItemTitleClampClassName,
} from "./hostCheckoutLayout";

describe("hostCheckoutLayout", () => {
  it("acota el shell al viewport en grid/flex", () => {
    expect(hostCheckoutLayoutPageInnerClassName).toContain("min-w-0");
    expect(hostCheckoutLayoutPageInnerClassName).toContain("max-w-7xl");
    expect(hostCheckoutLayoutGridClassName).toContain("min-w-0");
    expect(hostCheckoutLayoutGridClassName).toContain("minmax(0");
    expect(hostCheckoutLayoutFormColumnClassName).toContain("min-w-0");
    expect(hostCheckoutContainWidthClassName).toContain("max-w-full");
  });

  it("mantiene 1 columna móvil y 2 columnas desktop con minmax", () => {
    expect(hostCheckoutLayoutGridClassName).toContain("grid");
    expect(hostCheckoutLayoutGridClassName).toContain("grid-cols-1");
    expect(hostCheckoutLayoutGridClassName).toContain(
      "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]",
    );
  });

  it("acota line items del resumen con clamp y min-w-0", () => {
    expect(hostCheckoutLineItemRowClassName).toContain("min-w-0");
    expect(hostCheckoutLineItemRowClassName).toContain("max-w-full");
    expect(hostCheckoutLineItemTitleClampClassName).toContain("line-clamp-2");
    expect(hostCheckoutLineItemTitleClampClassName).not.toContain("nowrap");
  });
});
