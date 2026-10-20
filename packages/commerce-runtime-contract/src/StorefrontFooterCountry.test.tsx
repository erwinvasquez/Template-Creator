import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  readStoreCountryCode,
  StorefrontFooterCountry,
} from "./StorefrontFooterCountry";

function html(countryCode: string | null | undefined, locale = "es") {
  return renderToStaticMarkup(
    createElement(StorefrontFooterCountry, { countryCode, locale }),
  );
}

describe("StorefrontFooterCountry", () => {
  it("muestra Bolivia con bandera y nombre localizado", () => {
    const markup = html("bo");
    expect(markup).toContain('data-store-country="BO"');
    expect(markup).toContain("Bolivia");
    expect(markup).toContain("🇧🇴");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("text-[22px]");
    expect(markup).toContain("text-[15px]");
  });

  it("muestra un país distinto de Bolivia", () => {
    const markup = html("ES", "es");
    expect(markup).toContain('data-store-country="ES"');
    expect(markup).toContain("España");
    expect(markup).not.toContain("Bolivia");
  });

  it("no asigna país cuando falta o no es ISO2", () => {
    expect(html(null)).toBe("");
    expect(html(undefined)).toBe("");
    expect(html("")).toBe("");
    expect(html("BOL")).toBe("");
    expect(html("Bolivia")).toBe("");
  });

  it("el HTML de servidor coincide consigo mismo", () => {
    expect(html("MX", "en")).toBe(html("MX", "en"));
    expect(html("MX", "en")).toContain("Mexico");
  });

  it("lee el código solo si el payload lo trae normalizado", () => {
    expect(readStoreCountryCode({ storeCountryCode: " cl " })).toBe("CL");
    expect(readStoreCountryCode({})).toBeNull();
    expect(readStoreCountryCode({ storeCountryCode: "BOL" })).toBeNull();
  });
});
