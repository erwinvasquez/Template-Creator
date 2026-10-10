"use client";

import type {
  KitIncludeLineViewModel,
  KitSavingsViewModel,
} from "@shopenlinea/commerce-runtime-contract";

import type { KitCommercialCopy } from "./kitCommercialCopy";
import { kitCommercialCopy } from "./kitCommercialCopy";

export type { KitCommercialCopy };
export { kitCommercialCopy };

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
