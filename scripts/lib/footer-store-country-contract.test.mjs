import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { validateFooterStoreCountry } from "./footer-store-country-contract.mjs";

function writeFooter(dir, body) {
  const footerDir = path.join(dir, "src", "components");
  fs.mkdirSync(footerDir, { recursive: true });
  fs.writeFileSync(path.join(footerDir, "Footer.tsx"), body);
}

const valid = `"use client";
import { readStoreCountryCode, StorefrontFooterCountry } from "@shopenlinea/commerce-runtime-contract";
export function Footer() {
  return (
    <footer>
      <p data-wb-slot="footer.blurb">{footer.blurb}</p>
      <StorefrontFooterCountry countryCode={readStoreCountryCode(payload)} locale={payload.brand.locale} />
      <p data-wb-slot="footer.copyrightName">© {copyrightName}</p>
    </footer>
  );
}
`;

test("acepta el país en el bloque de la descripción", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "footer-ok-"));
  writeFooter(dir, valid);
  assert.deepEqual(validateFooterStoreCountry(dir), []);
});

test("rechaza el país bajo el copyright", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "footer-bad-"));
  writeFooter(
    dir,
    valid.replace(
      `<p data-wb-slot="footer.blurb">{footer.blurb}</p>
      <StorefrontFooterCountry countryCode={readStoreCountryCode(payload)} locale={payload.brand.locale} />
      <p data-wb-slot="footer.copyrightName">© {copyrightName}</p>`,
      `<p data-wb-slot="footer.blurb">{footer.blurb}</p>
      <p data-wb-slot="footer.copyrightName">© {copyrightName}
        <StorefrontFooterCountry countryCode={readStoreCountryCode(payload)} locale={payload.brand.locale} />
      </p>`,
    ),
  );
  const errors = validateFooterStoreCountry(dir);
  assert.ok(errors.some((error) => error.includes("before footer.copyrightName")));
});

test("rechaza un template sin el componente", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "footer-missing-"));
  writeFooter(
    dir,
    `<p data-wb-slot="footer.blurb"></p><p data-wb-slot="footer.copyrightName"></p>`,
  );
  const errors = validateFooterStoreCountry(dir);
  assert.ok(errors.length > 0);
});
