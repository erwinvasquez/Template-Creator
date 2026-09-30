#!/usr/bin/env node
/** Patch template schema.json: external ui ref + required ui + remove UiCopy def */
import fs from "node:fs";
import path from "node:path";

const templateId = process.argv[2];
const root = process.cwd();
const templates = templateId
  ? [templateId]
  : fs
      .readdirSync(path.join(root, "templates"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

for (const id of templates) {
  const schemaPath = path.join(root, "templates", id, "schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  if (!schema.required.includes("ui")) {
    schema.required.push("ui");
  }
  schema.properties.ui = {
    $ref: "../../packages/template-content-contract/uiCopy.schema.json",
  };
  if (schema.$defs?.UiCopy) {
    delete schema.$defs.UiCopy;
  }
  fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
  console.log(`Patched schema: ${id}`);
}
