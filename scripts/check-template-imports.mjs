#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const banned = [
  /from\s+["']firebase/,
  /from\s+["']firebase-admin/,
  /from\s+["']@firebase/,
  /from\s+["'].*firestore/,
  /modules\/ecommerce/,
  /from\s+["'].*\/repositories/,
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (/\.(ts|tsx|js|jsx)$/.test(name)) files.push(p);
  }
  return files;
}

const targets = [
  ...walk(path.join(root, "templates")),
  ...walk(path.join(root, "packages/commerce-runtime-contract/src")),
];

let failed = false;
for (const file of targets) {
  const text = fs.readFileSync(file, "utf8");
  for (const re of banned) {
    if (re.test(text)) {
      console.error("Banned import in", path.relative(root, file), re);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("check:template-imports OK (", targets.length, "files)");
