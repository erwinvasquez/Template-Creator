#!/usr/bin/env node
/**
 * WG-01 visual gate — lab preview at /t/* with ?payload=fixture
 * Requires: npm run dev (PORT default 3000)
 */
import { chromium } from "playwright";

const BASE = process.env.WG_LAB_URL ?? "http://localhost:3000";

const LABS = [
  { templateId: "fashion-atelier-v1", path: "/t/atelier" },
  { templateId: "food-cantina-v1", path: "/t/cantina" },
  { templateId: "academy-voxa-v1", path: "/t/voxa" },
  { templateId: "jewelry-orion-v1", path: "/t/orion" },
];

const SMOKE_LABS = [
  { path: "/t/celestine" },
  { path: "/t/lumen" },
  { path: "/t/nova" },
  { path: "/t/velvet" },
  { path: "/t/patisserie" },
  { path: "/t/trattoria" },
];

async function assertNoPageError(page) {
  const err = await page.locator("text=Application error").count();
  if (err > 0) throw new Error("Application error on page");
}

async function heroRoot(page) {
  return page.locator("section").filter({ has: page.locator('[data-wb-slot="hero.headline"]') }).first();
}

async function scenarioA(page, labPath) {
  await page.goto(`${BASE}${labPath}?payload=wg01-hero-simple`, { waitUntil: "networkidle" });
  await assertNoPageError(page);
  const slot = page.locator('[data-wb-slot="hero.image"]');
  await slot.waitFor({ state: "visible", timeout: 20000 });
  const carouselSlot = page.locator('[data-wb-slot="hero.carousel"]');
  const count = await carouselSlot.locator("img").count();
  if (count !== 1) throw new Error(`A: expected 1 hero image, got ${count}`);
  const style = await slot.evaluate((el) => getComputedStyle(el).objectPosition);
  if (!style.includes("50%")) throw new Error(`A: expected default focal ~50%, got ${style}`);
  const dots = page.locator('[data-hero-carousel-dot], button[aria-label*="slide"]');
  if ((await dots.count()) > 0) throw new Error("A: unexpected carousel controls");
}

async function scenarioB(page, labPath) {
  await page.goto(`${BASE}${labPath}?payload=wg01-hero-carousel-one`, { waitUntil: "networkidle" });
  await assertNoPageError(page);
  const imgs = page.locator('[data-wb-slot="hero.carousel.0"]');
  await imgs.waitFor({ state: "visible", timeout: 20000 });
  const slideSlots = page.locator('[data-wb-slot^="hero.carousel."]');
  if ((await slideSlots.count()) !== 1) {
    throw new Error(`B: expected single carousel slide slot, got ${await slideSlots.count()}`);
  }
}

async function scenarioC(page, labPath) {
  await page.goto(`${BASE}${labPath}?payload=wg01-hero-carousel-multi`, { waitUntil: "networkidle" });
  await assertNoPageError(page);
  for (let i = 0; i < 3; i++) {
    await page.locator(`[data-wb-slot="hero.carousel.${i}"]`).waitFor({ state: "attached", timeout: 20000 });
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  const visible = page.locator('[data-wb-slot="hero.carousel.0"]');
  await visible.waitFor({ state: "visible" });
  const headline = await page.locator('[data-wb-slot="hero.headline"]').textContent();
  if (!headline?.trim()) throw new Error("C: headline missing");
}

async function scenarioD(page, labPath) {
  const url = `${BASE}${labPath}?payload=wg01-hero-focal-desktop`;
  await page.goto(url, { waitUntil: "networkidle" });
  await assertNoPageError(page);
  const img = page.locator('[data-wb-slot="hero.image"]');
  await img.waitFor({ state: "visible", timeout: 20000 });
  let style = await img.evaluate((el) => el.style.objectPosition || getComputedStyle(el).objectPosition);
  if (!style.includes("15%") || !style.includes("25%")) {
    throw new Error(`D: expected 15% 25% object-position, got ${style}`);
  }
  await page.reload({ waitUntil: "networkidle" });
  style = await img.evaluate((el) => el.style.objectPosition || getComputedStyle(el).objectPosition);
  if (!style.includes("15%")) throw new Error(`D: focal not persisted after reload: ${style}`);
}

async function scenarioE(page, labPath) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}${labPath}?payload=wg01-hero-focal-mobile`, { waitUntil: "networkidle" });
  await assertNoPageError(page);
  const img = page.locator('[data-wb-slot="hero.image"]');
  await img.waitFor({ state: "visible", timeout: 20000 });
  let style = await img.evaluate((el) => el.style.objectPosition || getComputedStyle(el).objectPosition);
  if (!style.includes("85%") || !style.includes("70%")) {
    throw new Error(`E mobile: expected 85% 70%, got ${style}`);
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.reload({ waitUntil: "networkidle" });
  style = await img.evaluate((el) => el.style.objectPosition || getComputedStyle(el).objectPosition);
  if (!style.includes("15%") || !style.includes("25%")) {
    throw new Error(`E desktop after mobile: expected desktop focal 15% 25%, got ${style}`);
  }
}

async function smokeLab(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await assertNoPageError(page);
  await page.locator('[data-wb-slot="hero.headline"], [data-wb-slot="hero.image"], [data-wb-slot^="hero.carousel."]').first().waitFor({
    state: "visible",
    timeout: 25000,
  });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error" && /hero|carousel|hydrat/i.test(msg.text())) {
    consoleErrors.push(msg.text());
  }
});

try {
  for (const lab of LABS) {
    console.log(`\n=== ${lab.templateId} ===`);
    await scenarioA(page, lab.path);
    console.log("A OK");
    await scenarioB(page, lab.path);
    console.log("B OK");
    await scenarioC(page, lab.path);
    console.log("C OK");
    await scenarioD(page, lab.path);
    console.log("D OK");
    await scenarioE(page, lab.path);
    console.log("E OK");
  }

  console.log("\n=== smoke six templates ===");
  for (const lab of SMOKE_LABS) {
    await smokeLab(page, lab.path);
    console.log(`smoke OK ${lab.path}`);
  }

  if (consoleErrors.length) {
    throw new Error(`Console errors: ${consoleErrors.join("; ")}`);
  }
  console.log("\nwg01-hero-visual-gate OK");
} finally {
  await browser.close();
}
