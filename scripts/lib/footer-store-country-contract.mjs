/**
 * El footer no se hereda de un componente compartido por template:
 * cada Footer.tsx es código propio. Este contrato es el punto obligatorio
 * de generación/validación (`template:validate` corre antes de exportar).
 */
import fs from "node:fs";
import path from "node:path";

const BLURB = 'data-wb-slot="footer.blurb"';
const COPYRIGHT = 'data-wb-slot="footer.copyrightName"';
const COUNTRY = "<StorefrontFooterCountry";

export function validateFooterStoreCountry(templateDir) {
  const errors = [];
  const footerPath = path.join(templateDir, "src", "components", "Footer.tsx");
  if (!fs.existsSync(footerPath)) {
    errors.push("[footer-country] Footer.tsx is required");
    return errors;
  }

  const footer = fs.readFileSync(footerPath, "utf8");
  const blurbAt = footer.indexOf(BLURB);
  const countryAt = footer.indexOf(COUNTRY);
  const copyrightAt = footer.indexOf(COPYRIGHT);
  const occurrences = footer.split(COUNTRY).length - 1;

  if (
    !footer.includes("readStoreCountryCode") ||
    !footer.includes("StorefrontFooterCountry") ||
    !footer.includes("@shopenlinea/commerce-runtime-contract")
  ) {
    errors.push(
      "[footer-country] Footer must import readStoreCountryCode and StorefrontFooterCountry from @shopenlinea/commerce-runtime-contract",
    );
  }
  if (occurrences !== 1) {
    errors.push(
      "[footer-country] StorefrontFooterCountry must be rendered exactly once",
    );
  }
  if (!(blurbAt >= 0 && countryAt > blurbAt && copyrightAt > countryAt)) {
    errors.push(
      "[footer-country] StorefrontFooterCountry must sit in the blurb block, after footer.blurb and before footer.copyrightName",
    );
  }
  if (footer.includes("Bolivia")) {
    errors.push("[footer-country] Footer must not hardcode a country name");
  }

  return errors;
}
