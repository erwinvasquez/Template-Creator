#!/usr/bin/env node
/** Deep-rename section keys in a template directory */
import fs from "node:fs";
import path from "node:path";

const templateId = process.argv[2];
const mapJson = process.argv[3];
if (!templateId || !mapJson) process.exit(1);

const sectionMap = JSON.parse(fs.readFileSync(mapJson, "utf8"));
const root = path.join(process.cwd(), "templates", templateId);

const pairs = Object.entries(sectionMap).flatMap(([from, to]) => [
  [`sections.${from}`, `sections.${to}`],
  [`"${from}"`, `"${to}"`],
  [`${from}.`, `${to}.`],
  [`${from}?`, `${to}?`],
  [`${from}:`, `${to}:`],
  [`${from} `, `${to} `],
  [`/${from}`, `/${to}`],
  [`getOccasionCollections`, `get${cap(to)}Collections`],
  [`getSignatureProducts`, `get${cap(to)}Products`],
  [`getAccessoryProducts`, `get${cap(to)}Products`],
]);

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function walk(dir, fn) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.name === "node_modules" || ent.name === ".DS_Store") continue;
    if (ent.isDirectory()) walk(p, fn);
    else fn(p);
  }
}

walk(root, (filePath) => {
  if (!/\.(json|ts|tsx|md|css)$/.test(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;
  for (const [from, to] of pairs) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(filePath, content);
});

console.log(`Renamed sections in ${templateId}`);
