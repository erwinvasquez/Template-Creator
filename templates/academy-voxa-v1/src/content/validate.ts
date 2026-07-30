import type { ContentPayload } from "./types";
import schema from "../../schema.json";

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

export function validatePayload(payload: unknown): ValidationResult {
  const errors: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Ajv2020 = require("ajv/dist/2020").default ?? require("ajv/dist/2020");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const addFormats = require("ajv-formats").default ?? require("ajv-formats");

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const schemaOk = validate(payload);
  if (!schemaOk && validate.errors) {
    for (const err of validate.errors) {
      errors.push(`${err.instancePath || "/"} ${err.message ?? "invalid"}`);
    }
  }

  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: errors.length ? errors : ["Payload is not an object"] };
  }

  const p = payload as ContentPayload;

  const productSlugs = new Set<string>();
  for (const product of p.catalog?.products ?? []) {
    if (productSlugs.has(product.slug)) {
      errors.push(`Duplicate product slug: ${product.slug}`);
    }
    productSlugs.add(product.slug);
  }

  const categoryIds = new Set((p.catalog?.categories ?? []).map((c) => c.id));
  const collectionIds = new Set((p.catalog?.collections ?? []).map((c) => c.id));
  const productIds = new Set((p.catalog?.products ?? []).map((x) => x.id));

  for (const product of p.catalog?.products ?? []) {
    if (!categoryIds.has(product.categoryId)) {
      errors.push(`Product ${product.id} references missing categoryId ${product.categoryId}`);
    }
    if (!collectionIds.has(product.collectionId)) {
      errors.push(
        `Product ${product.id} references missing collectionId ${product.collectionId}`,
      );
    }
    if (!product.image?.url && !product.image?.mediaId) {
      errors.push(`Product ${product.id} image missing url/mediaId`);
    }
  }

  const programIds = p.sections?.programs?.productIds ?? [];
  for (const id of programIds) {
    if (!productIds.has(id)) {
      errors.push(`sections.programs.productIds missing product ${id}`);
    }
  }
  if (programIds.length !== 3) {
    errors.push("sections.programs.productIds must have exactly 3 items");
  }

  const bookIds = p.sections?.books?.productIds ?? [];
  for (const id of bookIds) {
    if (!productIds.has(id)) {
      errors.push(`sections.books.productIds missing product ${id}`);
    }
  }
  if (bookIds.length < 2) {
    errors.push("sections.books.productIds must have at least 2 items");
  }

  const methodSteps = p.sections?.method?.steps ?? [];
  if (methodSteps.length < 3 || methodSteps.length > 4) {
    errors.push("sections.method.steps must have 3 or 4 items");
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}
