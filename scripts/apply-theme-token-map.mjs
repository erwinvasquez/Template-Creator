#!/usr/bin/env node
/**
 * Apply TEMPLATE-THEME-TOKEN-MAP to one or more templates.
 * Usage: node scripts/apply-theme-token-map.mjs fashion-celestine-v1 [more...]
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  THEME_TEMPLATE_CONFIG,
  applyThemeTokenMapToTemplate,
  ensureInkInBuilderManifest,
  ensureInkInCss,
  patchThemeStyle,
  validateThemeTokenContract,
} from "./lib/theme-token-contract.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ids = process.argv.slice(2);

if (ids.length === 0) {
  console.error("Usage: node scripts/apply-theme-token-map.mjs <templateId> [...]");
  process.exit(1);
}

let failed = false;
for (const id of ids) {
  const cfg = THEME_TEMPLATE_CONFIG[id];
  if (!cfg) {
    console.error(`No theme config for ${id}`);
    failed = true;
    continue;
  }
  const dir = path.join(root, "templates", id);
  ensureInkInCss(dir, cfg.ink);
  patchThemeStyle(dir, cfg);
  applyThemeTokenMapToTemplate(dir);
  ensureInkInBuilderManifest(dir, cfg.ink);

  const errors = validateThemeTokenContract(dir);
  if (errors.length) {
    console.error(`${id}:`);
    for (const e of errors) console.error(`  ${e}`);
    failed = true;
  } else {
    console.log(`OK: ${id}`);
  }
}

process.exit(failed ? 1 : 0);
