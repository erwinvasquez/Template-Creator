"use client";

/**
 * País de la tienda en el footer. No usa geolocalización ni un país por defecto.
 * La bandera es SVG local (un chunk por ISO2). El nombre localizado es la
 * fuente legible; si no hay recurso, no se pinta un gráfico ni letras.
 */

import { Suspense, use } from "react";

import { loadStorefrontCountryFlag } from "./storefrontCountryFlagSvg";

function normalizeStoreCountryIso(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cc = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(cc) ? cc : null;
}

function localizedCountryName(iso: string, locale: string | undefined): string {
  const tag = locale?.trim() || "es";
  try {
    return new Intl.DisplayNames([tag], { type: "region" }).of(iso) ?? iso;
  } catch {
    return iso;
  }
}

export function readStoreCountryCode(payload: object): string | null {
  return normalizeStoreCountryIso(
    (payload as { storeCountryCode?: unknown }).storeCountryCode,
  );
}

function StorefrontFooterFlag({ iso }: { iso: string }) {
  const svg = use(loadStorefrontCountryFlag(iso));
  if (!svg) return null;
  return (
    <span
      aria-hidden="true"
      className="text-[22px] leading-none"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function StorefrontFooterCountry({
  countryCode,
  locale,
}: {
  countryCode?: string | null;
  locale?: string;
}) {
  const iso = normalizeStoreCountryIso(countryCode);
  if (!iso) return null;
  const name = localizedCountryName(iso, locale);

  return (
    <span
      className="mt-4 inline-flex max-w-full items-center gap-2"
      data-store-country={iso}
    >
      <Suspense fallback={null}>
        <StorefrontFooterFlag iso={iso} />
      </Suspense>
      <span className="truncate text-[15px] leading-none">{name}</span>
    </span>
  );
}
