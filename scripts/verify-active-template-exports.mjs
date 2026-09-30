#!/usr/bin/env node
/**
 * Policy A: dist/packages must be reproducible from templates/.
 * 1) Export all active templates once — working tree dist/ must match HEAD (committed exports).
 * 2) Export again — no further changes (BUILD_INFO.exportedAt stable when contentHash unchanged).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ACTIVE = [
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

function distDiffNames() {
  return execSync("git diff --name-only -- dist/packages", {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
}

function exportAll() {
  for (const templateId of ACTIVE) {
    const src = path.join(ROOT, "templates", templateId);
    if (!fs.existsSync(src)) {
      console.error(`Missing templates/${templateId}`);
      process.exit(1);
    }
    console.log(`Export ${templateId}...`);
    execSync(`node scripts/template-export.mjs ${templateId}`, {
      stdio: "inherit",
      cwd: ROOT,
    });
    const dist = path.join(ROOT, "dist", "packages", templateId);
    for (const file of ["IMMUTABLE", "BUILD_INFO.json"]) {
      if (!fs.existsSync(path.join(dist, file))) {
        console.error(`Missing dist/packages/${templateId}/${file}`);
        process.exit(1);
      }
    }
    const bi = JSON.parse(fs.readFileSync(path.join(dist, "BUILD_INFO.json"), "utf8"));
    if (!bi.contentHash || bi.templateId !== templateId) {
      console.error(`Invalid BUILD_INFO for ${templateId}`);
      process.exit(1);
    }
  }
}

exportAll();
const afterFirst = distDiffNames();
if (afterFirst) {
  console.error(
    "verify-active-template-exports: dist/packages differs from git after export — commit synced exports from templates/",
  );
  console.error(afterFirst);
  process.exit(1);
}

console.log("Re-export (determinism)...");
exportAll();
const afterSecond = distDiffNames();
if (afterSecond) {
  console.error(
    "verify-active-template-exports: second export changed dist/packages — export is not deterministic",
  );
  console.error(afterSecond);
  process.exit(1);
}

console.log("verify-active-template-exports OK");
