import { describe, expect, it } from "vitest";

import { DEFAULT_PREVIEW_CAPABILITIES } from "./capabilities";
import {
  buildCatalogSalesModeEntryOptions,
  parseCatalogSalesModeQuery,
  salesModeSwitchLinkClassName,
  shouldShowCatalogEntrySelector,
  showsDualCatalogSalesMode,
} from "./catalogSalesModeEntry";

describe("catalogSalesModeEntry", () => {
  const dualCapabilities = {
    ...DEFAULT_PREVIEW_CAPABILITIES,
    salesModeSwitch: "supported" as const,
  };

  it("un catálogo: no muestra selector inicial", () => {
    expect(
      shouldShowCatalogEntrySelector(DEFAULT_PREVIEW_CAPABILITIES, null),
    ).toBe(false);
    expect(showsDualCatalogSalesMode(DEFAULT_PREVIEW_CAPABILITIES)).toBe(false);
  });

  it("dos catálogos sin salesMode en URL: muestra selector inicial", () => {
    expect(shouldShowCatalogEntrySelector(dualCapabilities, null)).toBe(true);
    expect(shouldShowCatalogEntrySelector(dualCapabilities, "")).toBe(true);
  });

  it("dos catálogos con salesMode en URL: no muestra selector inicial", () => {
    expect(shouldShowCatalogEntrySelector(dualCapabilities, "stock")).toBe(
      false,
    );
    expect(
      shouldShowCatalogEntrySelector(dualCapabilities, "madeToOrder"),
    ).toBe(false);
  });

  it("buildCatalogSalesModeEntryOptions usa nav y shopBanner", () => {
    const options = buildCatalogSalesModeEntryOptions(
      {
        nav: [{ salesMode: "stock", label: "Entrega inmediata" }],
        stock: { shopBanner: "Comprá ahora." },
        madeToOrder: {
          navLabel: "Bajo pedido",
          shopBanner: "Pedido bajo demanda.",
        },
      },
      (mode) => `/shop?salesMode=${mode}`,
    );
    expect(options).toHaveLength(2);
    expect(options[0]).toMatchObject({
      salesMode: "stock",
      label: "Entrega inmediata",
      description: "Comprá ahora.",
      href: "/shop?salesMode=stock",
    });
    expect(options[1]?.label).toBe("Bajo pedido");
  });

  it("salesModeSwitchLinkClassName marca activo con border-bottom", () => {
    expect(salesModeSwitchLinkClassName(true)).toContain("border-primary");
    expect(salesModeSwitchLinkClassName(true)).toContain("border-b-2");
    expect(salesModeSwitchLinkClassName(false)).toContain("border-transparent");
  });

  it("parseCatalogSalesModeQuery", () => {
    expect(parseCatalogSalesModeQuery("stock")).toBe("stock");
    expect(parseCatalogSalesModeQuery("made-up")).toBe(null);
  });
});
