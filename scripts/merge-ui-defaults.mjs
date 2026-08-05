#!/usr/bin/env node
/**
 * Merge canonical ui.* seed into template defaults (preserves existing values).
 * Usage: node scripts/merge-ui-defaults.mjs [templateId]
 */
import fs from "node:fs";
import path from "node:path";
import { deepMerge } from "./lib/content-contract.mjs";

const templateId = process.argv[2] || "fashion-atelier-v1";
const root = process.cwd();
const templateRoot = path.join(root, "templates", templateId);
const seed = JSON.parse(
  fs.readFileSync(
    path.join(root, "packages/template-content-contract/uiCopy.defaults.seed.json"),
    "utf8",
  ),
);
const defaultsPath = path.join(templateRoot, "defaults.json");
const defaults = JSON.parse(fs.readFileSync(defaultsPath, "utf8"));

defaults.ui = deepMerge(seed, defaults.ui || {});

// Preserve template-specific salesMode.nav hrefs from existing shop path
const shopRoute =
  JSON.parse(fs.readFileSync(path.join(templateRoot, "manifest.json"), "utf8"))
    .routes?.find((r) => r.page === "shop")?.path ?? "/tienda";
if (defaults.ui?.salesMode?.nav) {
  for (const item of defaults.ui.salesMode.nav) {
    if (item.href?.startsWith("?")) {
      item.href = `${shopRoute}${item.href}`;
    }
  }
}

fs.writeFileSync(defaultsPath, `${JSON.stringify(defaults, null, 2)}\n`);
console.log(`Merged ui.* into ${defaultsPath}`);
