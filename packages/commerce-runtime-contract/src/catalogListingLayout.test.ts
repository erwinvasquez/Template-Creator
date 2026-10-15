import { describe, expect, it } from "vitest";

import {
  catalogListingRootClassName,
  catalogPageContainerClassName,
  catalogProductCardClassName,
  catalogProductGridClassName,
} from "./catalogListingLayout";

describe("catalogListingLayout", () => {
  it("acota el shell de página al viewport en flex", () => {
    expect(catalogPageContainerClassName).toContain("min-w-0");
    expect(catalogPageContainerClassName).toContain("w-full");
    expect(catalogPageContainerClassName).toContain("max-w-7xl");
  });

  it("usa una columna en móvil y dos desde sm", () => {
    expect(catalogProductGridClassName).toContain("grid-cols-1");
    expect(catalogProductGridClassName).toContain("sm:grid-cols-2");
  });

  it("evita expansión de tarjetas y listado", () => {
    expect(catalogListingRootClassName).toContain("min-w-0");
    expect(catalogProductCardClassName).toContain("max-w-full");
  });
});
