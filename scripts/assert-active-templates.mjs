#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

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

let failed = 0;
for (const id of ACTIVE) {
  const dir = path.join(process.cwd(), "templates", id);
  if (!fs.existsSync(dir)) {
    console.error(`assert-active-templates: missing templates/${id}`);
    failed++;
  }
}
if (failed > 0) process.exit(1);
console.log(`assert-active-templates OK (${ACTIVE.length} templates)`);
