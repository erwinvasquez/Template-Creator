#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const HOST_CONTROLLED = new Set([
  "taxCalculation",
  "shippingCalculation",
  "inventoryValidation",
  "placeOrder",
]);

function validateBusinessRules(commerce) {
  const errors = [];
  if (!commerce) return ["commerce block missing"];
  if (commerce.mode === "runtime" && !commerce.contractVersion) {
    errors.push("contractVersion required when mode === runtime");
  }
  if (commerce.views?.productListing) {
    if (commerce.capabilities?.cursorPagination !== "required") {
      errors.push("cursorPagination must be required when productListing enabled");
    }
  }
  for (const key of HOST_CONTROLLED) {
    const level = commerce.capabilities?.[key];
    if (level && level !== "host-controlled") {
      errors.push(`${key} must be host-controlled`);
    }
  }
  return errors;
}

const schemaPath = path.join(
  root,
  "templates/fashion-atelier-v1/commerce.schema.json",
);
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

const TEMPLATE_IDS = [
  "fashion-atelier-v1",
  "jewelry-orion-v1",
  "academy-voxa-v1",
];
const ROUTE_PAGES = new Set(["home", "shop", "product", "about"]);

const errors = [];
const manifests = new Map();

for (const templateId of TEMPLATE_IDS) {
  const manifestPath = path.join(root, "templates", templateId, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifests.set(templateId, manifest);

  if (!validateSchema(manifest.commerce)) {
    console.error(
      `AJV schema errors (${templateId}):\n`,
      (validateSchema.errors ?? [])
        .map((e) => `${e.instancePath || "/"} ${e.message}`)
        .join("\n"),
    );
    process.exit(1);
  }

  for (const err of validateBusinessRules(manifest.commerce)) {
    errors.push(`[${templateId}] ${err}`);
  }

  for (const route of manifest.routes ?? []) {
    if (!ROUTE_PAGES.has(route.page)) {
      errors.push(
        `[${templateId}] routes[].page "${route.page}" outside { home, shop, product, about }`,
      );
    }
  }
}

const bad = {
  mode: "runtime",
  contractVersion: null,
  views: {
    productListing: true,
    productDetail: true,
    cartPage: true,
    cartDrawer: true,
    checkoutLayout: true,
    orderConfirmation: false,
  },
  capabilities: {
    cursorPagination: "supported",
    taxCalculation: "supported",
  },
};
const badBusiness = validateBusinessRules(bad);
const badSchemaOk = validateSchema(bad);
if (badBusiness.length === 0) {
  console.error("Expected invalid runtime manifest to fail business rules");
  process.exit(1);
}
if (!badSchemaOk) {
  // runtime + null version is still schema-valid; business rules catch it
}

if (errors.length) {
  console.error("Manifest invalid:\n", errors.join("\n"));
  process.exit(1);
}

console.log("validate:commerce-manifest OK");
for (const [templateId, manifest] of manifests) {
  console.log(`  ${templateId} commerce.mode =`, manifest.commerce.mode);
}
console.log("  AJV schema = pass");
console.log("  rejected invalid runtime sample (", badBusiness.length, "errors)");
