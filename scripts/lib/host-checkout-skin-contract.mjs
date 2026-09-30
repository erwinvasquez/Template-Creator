import fs from "node:fs";
import path from "node:path";

/** Mirrors HostCheckoutSkin — all keys required on templates with checkoutLayout. */
export const HOST_CHECKOUT_SKIN_REQUIRED_KEYS = [
  "inputClassName",
  "selectClassName",
  "labelClassName",
  "fieldLabelClassName",
  "mutedTextClassName",
  "sectionGapClassName",
  "phoneRowClassName",
  "Layout",
  "Field",
  "RadioOption",
  "PaymentCard",
  "SummaryLine",
  "LineItem",
  "CountrySelect",
  "CheckboxRow",
  "PhoneRow",
  "Notice",
  "ErrorText",
  "OrderSummary",
  "PrimaryButton",
  "SecondaryLink",
];

export const CHECKOUT_PRIMITIVE_EXPORTS = [
  "CheckoutField",
  "CheckoutRadioOption",
  "CheckoutPaymentCard",
  "CheckoutSummaryLine",
  "CheckoutLineItem",
  "CheckoutCountrySelect",
  "CheckoutCheckboxRow",
  "CheckoutPhoneRow",
  "CheckoutNotice",
  "CheckoutErrorText",
  "CheckoutOrderSummary",
  "CheckoutPrimaryButton",
  "CheckoutSecondaryLink",
];

export function requiresHostCheckoutSkin(manifest) {
  return manifest?.commerce?.views?.checkoutLayout === true;
}

/**
 * Static validation for host-owned checkout paint (no TS compile).
 * @param {string} templateRoot
 * @param {object} manifest
 * @returns {string[]}
 */
export function validateHostCheckoutSkin(templateRoot, manifest) {
  const errors = [];

  if (!requiresHostCheckoutSkin(manifest)) {
    return errors;
  }

  const skinPath = path.join(templateRoot, "src/checkout/hostCheckoutSkin.ts");
  const primitivesPath = path.join(templateRoot, "src/checkout/CheckoutPrimitives.tsx");
  const layoutPath = path.join(templateRoot, "src/components/commerce/CheckoutLayout.tsx");
  const clientPath = path.join(templateRoot, "src/client.ts");

  if (!fs.existsSync(skinPath)) {
    errors.push("[checkout-skin] missing src/checkout/hostCheckoutSkin.ts");
    return errors;
  }
  if (!fs.existsSync(primitivesPath)) {
    errors.push("[checkout-skin] missing src/checkout/CheckoutPrimitives.tsx");
  }
  if (!fs.existsSync(layoutPath)) {
    errors.push("[checkout-skin] missing src/components/commerce/CheckoutLayout.tsx");
  }

  const skinSrc = fs.readFileSync(skinPath, "utf8");
  if (!skinSrc.includes("satisfies HostCheckoutSkin")) {
    errors.push(
      "[checkout-skin] hostCheckoutSkin.ts must export with satisfies HostCheckoutSkin",
    );
  }

  for (const key of HOST_CHECKOUT_SKIN_REQUIRED_KEYS) {
    const re = new RegExp(`\\b${key}\\s*:`);
    if (!re.test(skinSrc)) {
      errors.push(`[checkout-skin] hostCheckoutSkin missing key: ${key}`);
    }
  }

  if (fs.existsSync(primitivesPath)) {
    const primitivesSrc = fs.readFileSync(primitivesPath, "utf8");
    for (const sym of CHECKOUT_PRIMITIVE_EXPORTS) {
      if (!primitivesSrc.includes(`export function ${sym}`)) {
        errors.push(`[checkout-skin] CheckoutPrimitives missing export function ${sym}`);
      }
    }
    if (!primitivesSrc.includes("compareAtPriceDisplay")) {
      errors.push(
        "[checkout-skin] CheckoutLineItem must support compareAtPriceDisplay (strikethrough price)",
      );
    }
    if (!primitivesSrc.includes("checkoutPhoneRowClassName")) {
      errors.push("[checkout-skin] CheckoutPrimitives must export checkoutPhoneRowClassName");
    }
  }

  if (manifest.commerce?.views?.checkoutPage !== false) {
    errors.push("[checkout-skin] manifest.commerce.views.checkoutPage must be false");
  }

  if (fs.existsSync(clientPath)) {
    const clientSrc = fs.readFileSync(clientPath, "utf8");
    if (/\bCheckoutPage\s*[:,]/.test(clientSrc)) {
      errors.push(
        "[checkout-skin] client.ts must not register CheckoutPage in commerceViews",
      );
    }
    for (const deprecated of [
      "CheckoutOrderSummary",
      "CheckoutDiscountCode",
      "CheckoutCustomerFields",
      "CheckoutShippingSelector",
      "CheckoutPaymentSelector",
    ]) {
      if (clientSrc.includes(deprecated)) {
        errors.push(`[checkout-skin] client.ts must not reference deprecated ${deprecated}`);
      }
    }
  }

  const rendererPath = path.join(templateRoot, "src/renderer.tsx");
  if (fs.existsSync(rendererPath)) {
    const rendererSrc = fs.readFileSync(rendererPath, "utf8");
    if (rendererSrc.includes("checkoutPage") || /\bpage\s*===\s*["']checkout["']/.test(rendererSrc)) {
      errors.push(
        "[checkout-skin] renderer.tsx must not handle checkout page (host-owned URL)",
      );
    }
  }

  return errors;
}
