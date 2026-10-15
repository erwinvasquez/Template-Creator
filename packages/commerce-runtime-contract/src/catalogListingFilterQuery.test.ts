import { describe, expect, it } from "vitest";

import { applyCatalogFilterPatchToSearchParams } from "./catalogListingFilterQuery";

describe("applyCatalogFilterPatchToSearchParams", () => {
  it("serializa multiselect y flags FILTER-01", () => {
    const params = new URLSearchParams("categoryId=legacy");
    applyCatalogFilterPatchToSearchParams(params, {
      categoryIds: ["a", "b"],
      colors: ["rojo"],
      hideOutOfStock: true,
      hasDiscount: true,
      priceMin: 10,
      priceMax: null,
    });
    expect(params.get("categoryIds")).toBe("a,b");
    expect(params.get("colors")).toBe("rojo");
    expect(params.get("hideOutOfStock")).toBe("1");
    expect(params.get("hasDiscount")).toBe("1");
    expect(params.get("priceMin")).toBe("10");
    expect(params.has("categoryId")).toBe(false);
  });

  it("serializa salesMode cuando cambia catálogo desde filtros", () => {
    const params = new URLSearchParams();
    applyCatalogFilterPatchToSearchParams(params, { salesMode: "madeToOrder" });
    expect(params.get("salesMode")).toBe("madeToOrder");
  });

  it("elimina slugs legacy categoria/coleccion al aplicar patch", () => {
    const params = new URLSearchParams("categoria=mujer&coleccion=otono&categoryIds=cat-1");
    applyCatalogFilterPatchToSearchParams(params, { categoryIds: ["cat-1"] });
    expect(params.has("categoria")).toBe(false);
    expect(params.has("coleccion")).toBe(false);
    expect(params.get("categoryIds")).toBe("cat-1");
  });
});
