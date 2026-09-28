#!/usr/bin/env node
/**
 * Sprint N — patch builder.manifest, schema.json, copy pdp-presentation.ts, types snippet.
 */
import fs from "node:fs";
import path from "node:path";
import {
  TEMPLATE_IDS,
  PRODUCT_DETAIL_PRESENTATION_FIELDS,
  PRODUCT_UI_CONTENT_SLOT_IDS,
  productUiSlotDefinitions,
  PRODUCT_DETAIL_PRESENTATION_SCHEMA_DEF,
  SECTIONS_PRODUCT_SCHEMA_PROPERTY,
} from "./lib/pdp-presentation-contract.mjs";

const root = process.cwd();
const sourcePdpLib = path.join(
  root,
  "templates/fashion-atelier-v1/src/lib/pdp-presentation.ts",
);

for (const templateId of TEMPLATE_IDS) {
  const templateRoot = path.join(root, "templates", templateId);
  const pdpDest = path.join(templateRoot, "src/lib/pdp-presentation.ts");
  if (templateId !== "fashion-atelier-v1") {
    fs.copyFileSync(sourcePdpLib, pdpDest);
  }

  // builder.manifest.json
  const builderPath = path.join(templateRoot, "builder.manifest.json");
  const builder = JSON.parse(fs.readFileSync(builderPath, "utf8"));
  builder.manifest.capabilities ??= {};
  builder.manifest.capabilities.productDetailPresentation = {
    supportedFields: [...PRODUCT_DETAIL_PRESENTATION_FIELDS],
  };

  const productPage = builder.manifest.pages.find((p) => p.page === "product");
  if (!productPage) {
    throw new Error(`${templateId}: missing product page`);
  }
  const productSection = productPage.sections.find((s) => s.id === "product");
  if (!productSection) {
    throw new Error(`${templateId}: missing product section`);
  }
  productSection.contentSlotIds = [...PRODUCT_UI_CONTENT_SLOT_IDS];

  const contentSupport = builder.manifest.capabilities.contentSupport;
  if (!contentSupport?.slotDefinitions) {
    throw new Error(`${templateId}: missing manifest.capabilities.contentSupport.slotDefinitions`);
  }
  const existingIds = new Set(
    contentSupport.slotDefinitions.map((s) => s.id),
  );
  const newSlots = productUiSlotDefinitions().filter((s) => !existingIds.has(s.id));
  contentSupport.slotDefinitions.push(...newSlots);

  fs.writeFileSync(builderPath, `${JSON.stringify(builder, null, 2)}\n`);

  // schema.json — $defs + sections.product optional
  const schemaPath = path.join(templateRoot, "schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  schema.$defs ??= {};
  schema.$defs.ProductDetailPresentation =
    PRODUCT_DETAIL_PRESENTATION_SCHEMA_DEF.ProductDetailPresentation;
  const sections = schema.$defs.Sections;
  if (!sections.properties.product) {
    sections.properties.product = SECTIONS_PRODUCT_SCHEMA_PROPERTY.product;
  }
  fs.writeFileSync(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);

  // types.ts — add product? to sections if missing
  const typesPath = path.join(templateRoot, "src/content/types.ts");
  let types = fs.readFileSync(typesPath, "utf8");
  if (!types.includes("presentation?: ProductDetailPresentation")) {
    types = types.replace(
      /(import type \{[^}]*\} from "\.\/resolve";)/,
      `$1\nimport type { ProductDetailPresentation } from "../lib/pdp-presentation";`,
    );
    if (!types.includes("ProductDetailPresentation")) {
      types = `import type { ProductDetailPresentation } from "../lib/pdp-presentation";\n${types}`;
    }
    types = types.replace(
      /(\s+footer: \{[\s\S]*?\n    \};\n)(  \};)/,
      `$1    product?: {\n      presentation?: ProductDetailPresentation;\n    };\n$2`,
    );
    fs.writeFileSync(typesPath, types);
  }

  console.log(`Patched ${templateId}`);
}
