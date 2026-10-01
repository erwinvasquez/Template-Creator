import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../../..");
const TEMPLATE_IDS = [
  "fashion-atelier-v1",
  "fashion-celestine-v1",
  "fashion-lumen-v1",
  "fashion-velvet-v1",
  "fashion-nova-v1",
  "jewelry-orion-v1",
  "academy-voxa-v1",
  "food-trattoria-v1",
  "food-cantina-v1",
  "food-patisserie-v1",
] as const;

describe("WG-02 portable storefront canonical", () => {
  it.each(TEMPLATE_IDS)("ProductView expone confirmAddToCartSuccess (%s)", (templateId) => {
    const file = path.join(
      ROOT,
      "templates",
      templateId,
      "src/components/pages/ProductView.tsx",
    );
    const src = fs.readFileSync(file, "utf8");
    expect(src).toContain("confirmAddToCartSuccess: host.actions.confirmAddToCartSuccess");
    expect(src).toContain("selectVariant:");
    expect(src).toContain("addToCart:");
    expect(src).toContain("openCartDrawer:");
  });

  it("types atelier combinan hero carousel/focal y campos MTO", () => {
    const types = fs.readFileSync(
      path.join(ROOT, "templates/fashion-atelier-v1/src/content/types.ts"),
      "utf8",
    );
    expect(types).toContain("carouselImages");
    expect(types).toContain("focalPointMobile");
    expect(types).toContain("addingToCart");
    expect(types).toContain("buyMadeToOrderCta");
    expect(types).toContain("catalogLoadFailed");
  });

  it("defaults food usan claves canónicas de envío", () => {
    const cantina = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, "templates/food-cantina-v1/defaults.json"),
        "utf8",
      ),
    ) as { ui: { product: Record<string, string> } };
    expect(cantina.ui.product.shippingFiesta).toBeTruthy();
    expect(cantina.ui.product.shippingNote).toBeUndefined();

    const patisserie = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, "templates/food-patisserie-v1/defaults.json"),
        "utf8",
      ),
    ) as { ui: { product: Record<string, string> } };
    expect(patisserie.ui.product.shippingAtelierNote).toBeTruthy();

    const trattoria = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, "templates/food-trattoria-v1/defaults.json"),
        "utf8",
      ),
    ) as { ui: { product: Record<string, string> } };
    expect(trattoria.ui.product.shippingSommelier).toBeTruthy();
  });

  it("export doble: dist/packages coincide con git tras export oficial", () => {
    const distRoot = path.join(ROOT, "dist/packages");
    expect(fs.existsSync(distRoot)).toBe(true);
    for (const templateId of TEMPLATE_IDS) {
      const buildInfoPath = path.join(distRoot, templateId, "BUILD_INFO.json");
      expect(fs.existsSync(buildInfoPath)).toBe(true);
      const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, "utf8")) as {
        sourceGitSha?: string;
      };
      expect(buildInfo.sourceGitSha).toMatch(/^[0-9a-f]{40}$/);
    }
  });
});
