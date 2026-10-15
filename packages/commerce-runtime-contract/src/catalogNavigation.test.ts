import { describe, expect, it } from "vitest";

import {
  resolveCatalogShopNavigationHref,
  resolvePlpReturnHrefForRouter,
} from "./catalogNavigation";

const ORG = "tienda-shopenlinea";
const BASE = `/site/${ORG}`;

describe("catalogNavigation", () => {
  it("href canónico absoluto no duplica prefijo (stock)", () => {
    const saved = `/site/${ORG}/tienda?salesMode=stock`;
    expect(resolvePlpReturnHrefForRouter(saved, BASE)).toBe(saved);
  });

  it("href canónico absoluto no duplica prefijo (madeToOrder)", () => {
    const saved = `/site/${ORG}/tienda?salesMode=madeToOrder`;
    expect(resolvePlpReturnHrefForRouter(saved, BASE)).toBe(saved);
  });

  it("preserva búsqueda sin duplicar prefijo", () => {
    const saved = `/site/${ORG}/tienda?salesMode=stock&q=rojo`;
    expect(resolvePlpReturnHrefForRouter(saved, BASE)).toBe(saved);
  });

  it("preserva filtros múltiples sin duplicar prefijo", () => {
    const saved = `/site/${ORG}/tienda?salesMode=stock&q=rojo&colors=rojo&priceMin=10`;
    expect(resolvePlpReturnHrefForRouter(saved, BASE)).toBe(saved);
  });

  it("legacy relativo /tienda se compone una sola vez", () => {
    expect(resolvePlpReturnHrefForRouter("/tienda?salesMode=stock", BASE)).toBe(
      `/site/${ORG}/tienda?salesMode=stock`,
    );
  });

  it("hydration: no genera /site/org/site/org/...", () => {
    const canonical = `/site/${ORG}/tienda?salesMode=stock`;
    const resolved = resolvePlpReturnHrefForRouter(canonical, BASE);
    expect(resolved).not.toContain(`/site/${ORG}/site/${ORG}`);
    expect(resolved).toBe(canonical);
  });

  it("resolveCatalogShopNavigationHref usa PLP guardada", () => {
    const host = {
      getPlpReturnHref: () => `/site/${ORG}/tienda?salesMode=stock&q=rojo`,
    };
    expect(resolveCatalogShopNavigationHref(host, BASE)).toBe(
      `/site/${ORG}/tienda?salesMode=stock&q=rojo`,
    );
  });
});
