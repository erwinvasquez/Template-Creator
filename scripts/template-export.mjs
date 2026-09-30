#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";

const templateId = process.argv[2] || "fashion-atelier-v1";
const srcRoot = path.join(process.cwd(), "templates", templateId);
const outRoot = path.join(process.cwd(), "dist", "packages", templateId);

if (!fs.existsSync(srcRoot)) {
  console.error(`Template not found: ${templateId}`);
  process.exit(1);
}

console.log(`Validating ${templateId}...`);
execSync(`node scripts/template-validate.mjs ${templateId}`, { stdio: "inherit" });
execSync(`node scripts/validate-template-package.mjs ${templateId}`, {
  stdio: "inherit",
});

const previousBuildInfoPath = path.join(outRoot, "BUILD_INFO.json");
let previousBuildInfo = null;
if (fs.existsSync(previousBuildInfoPath)) {
  try {
    previousBuildInfo = JSON.parse(fs.readFileSync(previousBuildInfoPath, "utf8"));
  } catch {
    previousBuildInfo = null;
  }
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
const exportedAt =
  previousBuildInfo?.contentHash === contentHash && previousBuildInfo.exportedAt
    ? previousBuildInfo.exportedAt
    : process.env.SOURCE_DATE_EPOCH
      ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
      : new Date().toISOString();
const buildInfo = {
  templateId,
  version: pkg.version,
  exportedAt,
  contentHash,
  immutable: true,
  source: `templates/${templateId}`,
};
fs.writeFileSync(
  path.join(outRoot, "BUILD_INFO.json"),
  JSON.stringify(buildInfo, null, 2) + "\n",
);

fs.writeFileSync(
  path.join(outRoot, "IMMUTABLE"),
  `Do not edit. Regenerate with: npm run template:export -- ${templateId}\n`,
);

console.log(`Exported immutable package → dist/packages/${templateId}`);
console.log(`contentHash: ${contentHash}`);
