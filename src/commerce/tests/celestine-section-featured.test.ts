import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ContentPayload } from "../../../templates/fashion-celestine-v1/src/content/types";
import {
  getAccessoryProducts,
  getSignatureProducts,
  resolveProducts,
} from "../../../templates/fashion-celestine-v1/src/content/resolve";

const defaultsPath = path.resolve(
  __dirname,
  "../../../templates/fashion-celestine-v1/defaults.json",
);

function loadDefaults(): ContentPayload {
  return JSON.parse(readFileSync(defaultsPath, "utf8")) as ContentPayload;
}

/** Simulate SaaS stamping featured on every catalog product. */
function withGlobalFeatured(payload: ContentPayload): ContentPayload {
  return {
    ...payload,
    catalog: {
      ...payload.catalog,
      products: payload.catalog.products.map((p) => ({
        ...p,
        badges: Array.from(new Set([...(p.badges ?? []), "featured" as const])),
      })),
    },
  };
}

describe("Celestine section featured badges", () => {
  it("defaults: accessories never featured; signature members are featured", () => {
    const payload = loadDefaults();
    const accessories = getAccessoryProducts(payload);
    expect(accessories.length).toBeGreaterThan(0);
    expect(accessories.every((p) => p.isFeatured === false)).toBe(true);

    const signature = getSignatureProducts(payload);
    expect(signature.length).toBeGreaterThan(0);
    expect(signature.every((p) => p.isFeatured === true)).toBe(true);
  });

  it("SaaS-style global featured badges do not leak into accessories", () => {
    const payload = withGlobalFeatured(loadDefaults());

    const catalogFeatured = resolveProducts(payload).filter((p) =>
      payload.sections.accessories.productIds.includes(p.id),
    );
    expect(catalogFeatured.every((p) => p.isFeatured === true)).toBe(true);

    const accessories = getAccessoryProducts(payload);
    expect(accessories.every((p) => p.isFeatured === false)).toBe(true);

    const signature = getSignatureProducts(payload);
    expect(signature.every((p) => p.isFeatured === true)).toBe(true);

    // isNew still comes from badges
    const lilia = signature.find((p) => p.id === "2");
    expect(lilia?.isNew).toBe(true);
  });
});
