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

describe("WA-01 home hero marker contract", () => {
  it.each(TEMPLATE_IDS)("%s Hero.tsx exposes data-storefront-home-hero", (templateId) => {
    const heroPath = path.join(ROOT, "templates", templateId, "src/components/Hero.tsx");
    const src = fs.readFileSync(heroPath, "utf8");
    expect(src).toContain("data-storefront-home-hero");
  });
});
