#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const require = createRequire(import.meta.url);

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run("npm", ["run", "typecheck:contract"]);
run("node", ["scripts/check-template-imports.mjs"]);
run("node", ["scripts/validate-commerce-manifest.mjs"]);

// Mock bridge smoke (dynamic import via tsx if available, else assert files exist)
import fs from "node:fs";
const mockPath = path.join(root, "src/commerce/mock/createMockCommerceBridge.ts");
const seedPath = path.join(root, "src/commerce/fixtures/seed.ts");
if (!fs.existsSync(mockPath) || !fs.existsSync(seedPath)) {
  console.error("Mock bridge fixtures missing");
  process.exit(1);
}

// Ensure contract has no firebase string
const contractSrc = path.join(root, "packages/commerce-runtime-contract/src");
for (const f of fs.readdirSync(contractSrc)) {
  const t = fs.readFileSync(path.join(contractSrc, f), "utf8");
  if (/firebase|firestore/i.test(t)) {
    console.error("Contract package must not mention firebase", f);
    process.exit(1);
  }
}

console.log("test:commerce OK");
