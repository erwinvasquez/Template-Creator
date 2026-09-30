import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const uiSchemaPath = path.join(
  root,
  "packages/template-content-contract/uiCopy.schema.json",
);

export function loadUiSchema() {
  return JSON.parse(fs.readFileSync(uiSchemaPath, "utf8"));
}

/** Load template schema.json with external ui.* ref inlined for Ajv. */
export function loadTemplateSchemaForAjv(templateRoot) {
  const schema = JSON.parse(
    fs.readFileSync(path.join(templateRoot, "schema.json"), "utf8"),
  );
  if (
    schema.properties?.ui?.$ref?.includes("template-content-contract/uiCopy.schema.json")
  ) {
    schema.properties.ui = loadUiSchema();
  }
  return schema;
}
