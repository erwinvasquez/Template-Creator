"use client";

import type {
  KitIncludeLineViewModel,
  KitSavingsViewModel,
} from "@shopenlinea/commerce-runtime-contract";

export type KitCommercialCopy = {
  includes: string;
  kitPrice: string;
  separate: string;
  savings: string;
};

/** Copy de la plantilla según el locale ya publicado en el contenido. */
export function kitCommercialCopy(locale: string | null | undefined): KitCommercialCopy {
  if ((locale ?? "").toLowerCase().startsWith("en")) {
    return {
      includes: "Includes",
      kitPrice: "Kit price",
      separate: "Bought separately",
      savings: "You save",
    };
  }
  return {
    includes: "Incluye",
    kitPrice: "Precio del kit",
    separate: "Comprados por separado",
    savings: "Ahorrás",
  };
}

export function KitIncludesList({
  includes,
  title,
}: {
  includes?: readonly KitIncludeLineViewModel[] | null;
  title: string;
}) {
  if (!includes || includes.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-primary">
        {includes.map((line) => (
          <li key={`${line.label}-${line.quantity}`}>
            {line.label} × {line.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KitSavingsBlock({
  savings,
  labels,
}: {
  savings?: KitSavingsViewModel | null;
  labels: KitCommercialCopy;
}) {
  if (!savings?.savingsDisplay) return null;
  return (
    <div className="mt-4 space-y-1 text-sm text-muted">
      <p>
        {labels.kitPrice}: {savings.kitPriceDisplay}
      </p>
      <p>
        {labels.separate}: {savings.separatePriceDisplay}
      </p>
      <p className="text-primary">
        {labels.savings}: {savings.savingsDisplay}
      </p>
    </div>
  );
}
