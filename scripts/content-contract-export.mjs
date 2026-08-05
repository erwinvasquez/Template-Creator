#!/usr/bin/env node
/**
 * Export immutable @web-generator/template-content-contract → dist/packages/template-content-contract
 * Copy together with template exports so schema.json $refs resolve in dist/.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const pkgId = "template-content-contract";
const srcRoot = path.join(process.cwd(), "packages", pkgId);
const outRoot = path.join(process.cwd(), "dist", "packages", pkgId);

if (!fs.existsSync(srcRoot)) {
  console.error(`Package not found: packages/${pkgId}`);
  process.exit(1);
}

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".DS_Store") continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function hashDir(dir) {
  const hash = crypto.createHash("sha256");
  function walk(current) {
    for (const entry of fs
      .readdirSync(current, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else {
        hash.update(path.relative(dir, full));
        hash.update(fs.readFileSync(full));
      }
    }
  }
  walk(dir);
  return hash.digest("hex");
}

rmrf(outRoot);
copyDir(srcRoot, outRoot);

const contentHash = hashDir(outRoot);
const pkg = JSON.parse(fs.readFileSync(path.join(outRoot, "package.json"), "utf8"));
const buildInfo = {
  packageId: pkgId,
  version: pkg.version,
  exportedAt: new Date().toISOString(),
  contentHash,
  immutable: true,
  source: `packages/${pkgId}`,
  artifacts: ["uiCopy.schema.json", "uiCopy.defaults.seed.json"],
};
fs.writeFileSync(
  path.join(outRoot, "BUILD_INFO.json"),
  JSON.stringify(buildInfo, null, 2) + "\n",
);

fs.writeFileSync(
  path.join(outRoot, "IMMUTABLE"),
  "Do not edit. Regenerate with: npm run content-contract:export\n",
);

console.log(`Exported immutable package → dist/packages/${pkgId}`);
console.log(`contentHash: ${contentHash}`);
