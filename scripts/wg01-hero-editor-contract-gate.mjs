#!/usr/bin/env node
/** Builder/editor contract for hero carousel (WG has no WYSIWYG editor UI). */
import fs from "node:fs";
import path from "node:path";

const TEMPLATES = [
  "academy-voxa-v1",
  "fashion-atelier-v1",
  "fashion-celestine-v1",
  "fashion-lumen-v1",
  "fashion-nova-v1",
  "fashion-velvet-v1",
  "food-cantina-v1",
  "food-patisserie-v1",
  "food-trattoria-v1",
  "jewelry-orion-v1",
];

for (const id of TEMPLATES) {
  const p = path.join(process.cwd(), "templates", id, "builder.manifest.json");
  const bm = JSON.parse(fs.readFileSync(p, "utf8"));
  const slots =
    bm.capabilities?.contentSupport?.slotDefinitions ??
    bm.manifest?.capabilities?.contentSupport?.slotDefinitions ??
    [];
  const image = slots.find((s) => s.id === "hero.image");
  const carousel = slots.find((s) => s.id === "hero.carousel");
  if (!image || image.kind !== "media") {
    throw new Error(`${id}: missing hero.image media slot`);
  }
  if (!carousel || carousel.kind !== "list" || !carousel.listSchema) {
    throw new Error(`${id}: missing hero.carousel list slot with listSchema`);
  }
  if (carousel.fieldPath !== "sections.hero.carouselImages") {
    throw new Error(`${id}: hero.carousel fieldPath mismatch`);
  }
}
console.log("wg01-hero-editor-contract-gate OK (builder slots ×10; UI editor lives in SaaS)");
