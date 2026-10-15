import { describe, expect, it } from "vitest";

import { hostCatalogSearchInputClassName } from "./hostCatalogLayout";
import { hostCheckoutInputClassName } from "./hostCheckoutLayout";

describe("hostCatalogLayout — iOS input zoom", () => {
  it("search input mobile usa text-base (≥16px)", () => {
    expect(hostCatalogSearchInputClassName).toContain("text-base");
    expect(hostCatalogSearchInputClassName).not.toContain("text-sm");
    expect(hostCatalogSearchInputClassName).not.toContain("text-xs");
  });

  it("checkout input mantiene text-base", () => {
    expect(hostCheckoutInputClassName).toContain("text-base");
  });

  it("no deshabilita zoom del viewport en clases de input", () => {
    const joined = `${hostCatalogSearchInputClassName} ${hostCheckoutInputClassName}`;
    expect(joined).not.toMatch(/maximum-scale|user-scalable\s*=\s*no/i);
  });
});
