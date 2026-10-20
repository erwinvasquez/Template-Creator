/**
 * País de la tienda en el footer. No usa geolocalización ni un país por defecto.
 * La bandera reutiliza el mismo algoritmo que `countryCodeToFlagEmoji`.
 * El nombre localizado es la fuente legible; el emoji no identifica solo.
 */

function normalizeStoreCountryIso(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cc = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(cc) ? cc : null;
}

function countryCodeToFlagEmoji(countryCode: string): string {
  return String.fromCodePoint(
    ...[...countryCode].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
  );
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
      <span aria-hidden="true" className="text-[22px] leading-none">
        {countryCodeToFlagEmoji(iso)}
      </span>
      <span className="truncate text-[15px] leading-none">{name}</span>
    </span>
  );
}
