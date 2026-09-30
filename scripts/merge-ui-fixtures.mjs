#!/usr/bin/env node
/** Merge ui seed into template fixtures */
import fs from "node:fs";
import path from "node:path";
import { deepMerge } from "./lib/content-contract.mjs";

const templateId = process.argv[2];
const root = process.cwd();
const templates = templateId
  ? [templateId]
  : fs
      .readdirSync(path.join(root, "templates"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

const seed = JSON.parse(
  fs.readFileSync(
    path.join(root, "packages/template-content-contract/uiCopy.defaults.seed.json"),
    "utf8",
  ),
);

for (const id of templates) {
  const fixturesDir = path.join(root, "templates", id, "fixtures");
  if (!fs.existsSync(fixturesDir)) continue;
  for (const file of fs.readdirSync(fixturesDir).filter((f) => f.endsWith(".json"))) {
    const fp = path.join(fixturesDir, file);
    const payload = JSON.parse(fs.readFileSync(fp, "utf8"));
    payload.ui = deepMerge(seed, payload.ui || {});
    fs.writeFileSync(fp, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`Merged ui into ${fp}`);
  }
}
