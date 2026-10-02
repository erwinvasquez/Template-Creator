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

describe("CAT-01 catalog sales mode entry contract", () => {
  it.each(TEMPLATE_IDS)("%s CommerceAwareCatalog uses CAT-01 entry gate", (templateId) => {
    const catalogPath = path.join(
      ROOT,
      "templates",
      templateId,
      "src/components/CommerceAwareCatalog.tsx",
    );
    const src = fs.readFileSync(catalogPath, "utf8");
    expect(src).toContain("shouldShowCatalogEntrySelector");
    expect(src).toContain("CatalogSalesModeEntrySelector");
    expect(src).toContain("buildCatalogSalesModeEntryOptions");
    expect(src).toMatch(/shouldShowCatalogEntrySelector\([\s\S]*getListing/);
  });

  it.each(TEMPLATE_IDS)("%s SalesModeShopBanner exposes active switch affordances", (templateId) => {
    const bannerPath = path.join(
      ROOT,
      "templates",
      templateId,
      "src/components/commerce/SalesModeShopBanner.tsx",
    );
    const src = fs.readFileSync(bannerPath, "utf8");
    expect(src).toContain("buildCatalogSalesModeEntryOptions");
    expect(src).toContain("salesModeSwitchLinkClassName");
    expect(src).toContain("aria-current");
    expect(src).toContain("aria-selected");
    expect(src).toContain("data-sales-mode-active");
  });

  it.each(TEMPLATE_IDS)("%s preserves WA-01 home hero marker", (templateId) => {
    const heroPath = path.join(ROOT, "templates", templateId, "src/components/Hero.tsx");
    const src = fs.readFileSync(heroPath, "utf8");
    expect(src).toContain("data-storefront-home-hero");
  });

  it("commerce-runtime-contract exports CAT-01 helpers", () => {
    const indexPath = path.join(
      ROOT,
      "packages/commerce-runtime-contract/src/index.ts",
    );
    const src = fs.readFileSync(indexPath, "utf8");
    expect(src).toContain("shouldShowCatalogEntrySelector");
    expect(src).toContain("salesModeSwitchLinkClassName");
    expect(fs.existsSync(path.join(ROOT, "packages/commerce-runtime-contract/src/catalogSalesModeEntry.ts"))).toBe(
      true,
    );
  });
});
