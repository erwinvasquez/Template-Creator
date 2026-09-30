#!/usr/bin/env node
/**
 * WG-00 — Local parity gate (not wired to CI).
 *
 * Compares Web Generator template sources + dist exports against a SaaS packages tree
 * and optional overlay directory. Fails on structural drift that should not happen
 * after a clean sync + overlay reapply.
 *
 * Usage:
 *   node scripts/wg-saas-parity-gate.mjs \
 *     --saas-root /path/to/SaaS \
 *     --templates academy-voxa-v1,fashion-atelier-v1 \
 *     [--overlay-root /path/to/SaaS/scripts/wg-sync-commerce-overlay]
 *
 * Env:
 *   WG_SHA — expected generator git SHA (optional)
 *   SAAS_SHA — expected SaaS git SHA (optional)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const ACTIVE_TEMPLATES = [
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

function parseArgs(argv) {
  const out = { templates: ACTIVE_TEMPLATES, overlayRoot: null, saasRoot: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--saas-root") out.saasRoot = argv[++i];
    else if (argv[i] === "--overlay-root") out.overlayRoot = argv[++i];
    else if (argv[i] === "--templates") {
      out.templates = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return out;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function gitSha(cwd) {
  try {
    return execSync("git rev-parse HEAD", { cwd, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function fail(msg) {
  console.error(`[wg-saas-parity-gate] FAIL: ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`[wg-saas-parity-gate] OK: ${msg}`);
}

const { saasRoot, overlayRoot, templates } = parseArgs(process.argv);
if (!saasRoot) {
  console.error("Missing --saas-root");
  process.exit(1);
}

const wgSha = process.env.WG_SHA || gitSha(ROOT);
const saasSha = process.env.SAAS_SHA || gitSha(saasRoot);
console.log(`WG_SHA=${wgSha ?? "?"}`);
console.log(`SAAS_SHA=${saasSha ?? "?"}`);

let errors = 0;

for (const templateId of templates) {
  const srcDir = path.join(ROOT, "templates", templateId);
  const distDir = path.join(ROOT, "dist", "packages", templateId);
  const saasPkg = path.join(saasRoot, "packages", templateId);

  if (!fs.existsSync(srcDir)) {
    fail(`missing WG source templates/${templateId}`);
    errors++;
    continue;
  }
  ok(`source present: ${templateId}`);

  if (!fs.existsSync(distDir)) {
    fail(`missing WG export dist/packages/${templateId} — run template:export`);
    errors++;
  } else {
    const immutable = path.join(distDir, "IMMUTABLE");
    const buildInfo = path.join(distDir, "BUILD_INFO.json");
    if (!fs.existsSync(immutable) || !fs.existsSync(buildInfo)) {
      fail(`${templateId}: export missing IMMUTABLE or BUILD_INFO.json`);
      errors++;
    } else {
      const bi = readJson(buildInfo);
      if (bi.templateId && bi.templateId !== templateId) {
        fail(`${templateId}: BUILD_INFO.templateId mismatch`);
        errors++;
      }
    }
  }

  if (!fs.existsSync(saasPkg)) {
    fail(`SaaS packages/${templateId} missing — template in SaaS but not mirrored`);
    errors++;
    continue;
  }

  const overlayDir = overlayRoot
    ? path.join(overlayRoot, templateId)
    : path.join(saasRoot, "scripts", "wg-sync-commerce-overlay", templateId);
  if (!fs.existsSync(overlayDir)) {
    fail(`overlay not defined for ${templateId}: ${overlayDir}`);
    errors++;
  }

  const wgBridge = path.join(distDir, "src/preview/createPayloadCommerceBridge.ts");
  const saasBridge = path.join(saasPkg, "src/preview/createPayloadCommerceBridge.ts");
  if (fs.existsSync(wgBridge) && fs.existsSync(saasBridge)) {
    const wgText = fs.readFileSync(wgBridge, "utf8");
    const saasText = fs.readFileSync(saasBridge, "utf8");
    const wgHasConfirm = wgText.includes("confirmAddToCartSuccess");
    const saasHasConfirm = saasText.includes("confirmAddToCartSuccess");
    if (!wgHasConfirm && saasHasConfirm) {
      console.warn(
        `[wg-saas-parity-gate] WARN ${templateId}: SaaS bridge has confirmAddToCartSuccess (overlay/runtime); WG export does not — expected until native WG commerce`,
      );
    }
  }

  const saasBiPath = path.join(saasPkg, "BUILD_INFO.json");
  if (fs.existsSync(saasBiPath) && fs.existsSync(path.join(distDir, "BUILD_INFO.json"))) {
    const wgBi = readJson(path.join(distDir, "BUILD_INFO.json"));
    const saasBi = readJson(saasBiPath);
    if (wgBi.contentHash !== saasBi.contentHash) {
      console.warn(
        `[wg-saas-parity-gate] WARN ${templateId}: contentHash WG ${wgBi.contentHash?.slice(0, 12)} ≠ SaaS ${saasBi.contentHash?.slice(0, 12)} (sync pending or overlay)`,
      );
    }
  }
}

if (errors > 0) {
  fail(`${errors} structural error(s)`);
} else {
  ok("structural checks passed (review WARN lines for overlay/sync drift)");
}
