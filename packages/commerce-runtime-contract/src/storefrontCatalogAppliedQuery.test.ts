import { describe, expect, it } from "vitest";

import {
  buildCatalogFilterPatchForNavigation,
  parseStorefrontCatalogAppliedQuery,
} from "./storefrontCatalogAppliedQuery";

describe("parseStorefrontCatalogAppliedQuery", () => {
  it("parsea colors y categoryIds multiselect", () => {
    const params = new URLSearchParams("colors=rojo&categoryIds=broche,diadema");
    const applied = parseStorefrontCatalogAppliedQuery({
      searchParams: params,
      defaultSalesMode: "stock",
    });
    expect(applied.filterPatch.colors).toEqual(["rojo"]);
    expect(applied.filterPatch.categoryIds).toEqual(["broche", "diadema"]);
  });

  it("buildCatalogFilterPatchForNavigation conserva color al aplicar categorías", () => {
    const params = new URLSearchParams("colors=rojo&categoryIds=diadema");
    const full = buildCatalogFilterPatchForNavigation(
      params,
      {
        salesMode: "stock",
        activeColors: ["rojo"],
        activeCategoryIds: ["diadema"],
      },
      { categoryIds: ["diadema", "broche"] },
      { defaultSalesMode: "stock" },
    );
    expect(full.colors).toEqual(["rojo"]);
    expect(full.categoryIds).toEqual(["diadema", "broche"]);
  });
});
