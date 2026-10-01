#!/usr/bin/env node
/**
 * Generates lab fixtures for WG-01 visual gate (from defaults.json per template).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TEMPLATES = [
  "fashion-atelier-v1",
  "food-cantina-v1",
  "academy-voxa-v1",
  "jewelry-orion-v1",
];

const IMG_A =
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80";
const IMG_B =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80";
const IMG_C =
  "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&q=80";

function media(url, alt, focal = undefined, focalMobile = undefined) {
  const m = { url, alt };
  if (focal) m.focalPoint = focal;
  if (focalMobile) m.focalPointMobile = focalMobile;
  return m;
}

function writeFixture(templateId, name, patchHero) {
  const defaultsPath = path.join(ROOT, "templates", templateId, "defaults.json");
  const payload = JSON.parse(fs.readFileSync(defaultsPath, "utf8"));
  payload.sections.hero = { ...payload.sections.hero, ...patchHero };
  const out = path.join(ROOT, "templates", templateId, "fixtures", `${name}.json`);
  fs.writeFileSync(out, JSON.stringify(payload, null, 2) + "\n");
  console.log(`wrote ${out}`);
}

for (const templateId of TEMPLATES) {
  writeFixture(templateId, "wg01-hero-simple", {
    carouselImages: [],
    image: media(IMG_A, "WG01 simple hero"),
  });
  writeFixture(templateId, "wg01-hero-carousel-one", {
    image: media(IMG_A, "ignored when carousel"),
    carouselImages: [media(IMG_B, "WG01 single carousel slide")],
  });
  writeFixture(templateId, "wg01-hero-carousel-multi", {
    image: media(IMG_A, "ignored"),
    carouselImages: [
      media(IMG_A, "slide 0"),
      media(IMG_B, "slide 1"),
      media(IMG_C, "slide 2"),
    ],
    carouselIntervalMs: 2000,
  });
  writeFixture(templateId, "wg01-hero-focal-desktop", {
    carouselImages: [],
    image: media(IMG_A, "focal desktop", { x: 0.15, y: 0.25 }),
  });
  writeFixture(templateId, "wg01-hero-focal-mobile", {
    carouselImages: [],
    image: media(IMG_A, "focal mobile test", { x: 0.15, y: 0.25 }, { x: 0.85, y: 0.7 }),
  });
}
