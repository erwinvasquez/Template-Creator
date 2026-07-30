import type { CommerceManifest } from "@shopenlinea/commerce-runtime-contract";

const HOST_CONTROLLED = new Set([
  "taxCalculation",
  "shippingCalculation",
  "inventoryValidation",
  "placeOrder",
]);

export type ManifestValidationResult = {
  ok: boolean;
  errors: string[];
};

export function validateCommerceManifest(
  commerce: CommerceManifest | null | undefined,
): ManifestValidationResult {
  const errors: string[] = [];
  if (!commerce) {
    return { ok: false, errors: ["commerce block missing"] };
  }

  if (commerce.mode === "runtime" && !commerce.contractVersion) {
    errors.push("contractVersion required when mode === runtime");
  }

  if (commerce.views.productListing) {
    const level = commerce.capabilities.cursorPagination;
    if (level !== "required") {
      errors.push(
        "cursorPagination must be required when productListing view is enabled",
      );
    }
  }

  for (const key of HOST_CONTROLLED) {
    const level = commerce.capabilities[key];
    if (level && level !== "host-controlled") {
      errors.push(`${key} must be host-controlled (got ${level})`);
    }
  }

  return { ok: errors.length === 0, errors };
}
