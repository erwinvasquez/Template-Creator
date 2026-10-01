#!/usr/bin/env node
/**
 * SF-01 visual gate — PDP gallery ↔ variant sync on lab (desktop + mobile).
 * Requires: npm run dev (PORT default 3000)
 */
import { chromium } from "playwright";

const BASE = process.env.WG_LAB_URL ?? "http://localhost:3000";

const LABS = [
  { path: "/t/atelier/tienda/sf01-gallery-sync?commerce=sf01-gallery-variant" },
  { path: "/t/orion/coleccion/sf01-gallery-sync?commerce=sf01-gallery-variant" },
  { path: "/t/cantina/tienda/sf01-gallery-sync?commerce=sf01-gallery-variant" },
];

async function assertNoPageError(page) {
  const err = await page.locator("text=Application error").count();
  if (err > 0) throw new Error("Application error on page");
}

async function scenarioGallerySync(page, labPath) {
  await page.goto(`${BASE}${labPath}`, { waitUntil: "networkidle" });
  await assertNoPageError(page);
  const img2 = page.getByRole("button", { name: "Imagen 2" });
  await img2.waitFor({ state: "visible", timeout: 20000 });
  await img2.click();
  const celeste = page.getByRole("button", { name: /celeste/i }).first();
  await celeste.waitFor({ state: "visible", timeout: 10000 });
  const cls = await celeste.getAttribute("class");
  if (!cls?.includes("border-primary") && !cls?.includes("border-cta")) {
    throw new Error(`SF-01: celeste chip not selected after gallery click (${cls})`);
  }
}

async function main() {
  const browser = await chromium.launch();
  for (const viewport of [
    { width: 1280, height: 800, label: "desktop" },
    { width: 390, height: 844, label: "mobile" },
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const lab of LABS) {
      await scenarioGallerySync(page, lab.path);
      console.log(`OK ${viewport.label} ${lab.path}`);
    }
    await context.close();
  }
  await browser.close();
  console.log("\nsf01-pdp-visual-gate OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
