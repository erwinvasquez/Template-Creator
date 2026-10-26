import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { prerender } from "react-dom/static";
import { describe, expect, it } from "vitest";

import {
  readStoreCountryCode,
  StorefrontFooterCountry,
} from "./StorefrontFooterCountry";
import { loadStorefrontCountryFlag } from "./storefrontCountryFlagSvg";
import { svg as boliviaFlag } from "./storefrontCountryFlags/BO";
import { svg as spainFlag } from "./storefrontCountryFlags/ES";

const REGIONAL_INDICATOR = /\u{1F1E6}/u;

async function html(countryCode: string | null | undefined, locale = "es") {
  const { prelude } = await prerender(
    createElement(StorefrontFooterCountry, { countryCode, locale }),
  );
  const reader = prelude.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const step = await reader.read();
    if (step.done) break;
    if (step.value) chunks.push(step.value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

describe("StorefrontFooterCountry", () => {
  it("muestra Bolivia con SVG y nombre localizado", async () => {
    const markup = await html("bo");
    expect(markup).toContain('data-store-country="BO"');
    expect(markup).toContain("Bolivia");
    expect(markup).toContain(boliviaFlag);
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("text-[22px]");
    expect(markup).toContain("text-[15px]");
    expect(markup).not.toMatch(REGIONAL_INDICATOR);
    expect(markup).not.toContain(">BO<");
  });

  it("muestra España con su propio SVG", async () => {
    const markup = await html("ES", "es");
    expect(markup).toContain('data-store-country="ES"');
    expect(markup).toContain("España");
    expect(markup).toContain(spainFlag);
    expect(markup).not.toContain("Bolivia");
    expect(markup).not.toContain(boliviaFlag);
    expect(markup).not.toMatch(REGIONAL_INDICATOR);
  });

  it("no asigna país cuando falta o no es ISO2", async () => {
    expect(await html(null)).toBe("");
    expect(await html(undefined)).toBe("");
    expect(await html("")).toBe("");
    expect(await html("BOL")).toBe("");
    expect(await html("Bolivia")).toBe("");
  });

  it("un ISO2 sin recurso conserva el nombre y omite el gráfico", async () => {
    const markup = await html("ZZ");
    expect(markup).toContain('data-store-country="ZZ"');
    expect(markup).not.toContain("<svg");
    expect(markup).not.toMatch(REGIONAL_INDICATOR);
  });

  it("el HTML de servidor es estable entre dos renders", async () => {
    const first = await html("MX", "en");
    const second = await html("MX", "en");
    expect(first).toBe(second);
    expect(first).toContain("Mexico");
    expect(first).toContain("<svg");
    expect(first).toContain('aria-hidden="true"');
  });

  it("el loader no incrusta el set completo y resuelve solo el ISO pedido", async () => {
    const loaderPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "storefrontCountryFlagSvg.ts",
    );
    const loader = readFileSync(loaderPath, "utf8");
    expect(loader).toContain('import("./storefrontCountryFlags/BO")');
    expect(loader).not.toContain("#FECA00");
    expect(loader).not.toContain("fromCodePoint");
    await expect(loadStorefrontCountryFlag("BO")).resolves.toBe(boliviaFlag);
    await expect(loadStorefrontCountryFlag("bo")).resolves.toBe(boliviaFlag);
    await expect(loadStorefrontCountryFlag("ZZ")).resolves.toBeNull();
  });

  it("lee el código solo si el payload lo trae normalizado", () => {
    expect(readStoreCountryCode({ storeCountryCode: " cl " })).toBe("CL");
    expect(readStoreCountryCode({})).toBeNull();
    expect(readStoreCountryCode({ storeCountryCode: "BOL" })).toBeNull();
  });
});
