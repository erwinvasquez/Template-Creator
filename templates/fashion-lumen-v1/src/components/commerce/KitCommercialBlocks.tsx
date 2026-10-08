"use client";

import type {
  KitChoiceSlotViewModel,
  KitIncludeLineViewModel,
  KitSavingsViewModel,
} from "@shopenlinea/commerce-runtime-contract";

export type KitCommercialCopy = {
  includes: string;
  kitPrice: string;
  separate: string;
  savings: string;
  choose: string;
  outOfStock: string;
  catalogPrice: string;
  availableOne: string;
  availableMany: (count: number) => string;
};

/** Copy de la plantilla según el locale ya publicado en el contenido. */
export function kitCommercialCopy(locale: string | null | undefined): KitCommercialCopy {
  if ((locale ?? "").toLowerCase().startsWith("en")) {
    return {
      includes: "Includes",
      kitPrice: "Kit price",
      separate: "Bought separately",
      savings: "You save",
      choose: "Choose a variant",
      outOfStock: "Sold out",
      catalogPrice: "Catalog price. It is not added to the kit.",
      availableOne: "1 available",
      availableMany: (count) => `${count} available`,
    };
  }
  return {
    includes: "Incluye",
    kitPrice: "Precio del kit",
    separate: "Comprados por separado",
    savings: "Ahorrás",
    choose: "Elige una variante",
    outOfStock: "Agotado",
    catalogPrice: "Precio de catálogo. No se suma al kit.",
    availableOne: "1 disponible",
    availableMany: (count) => `${count} disponibles`,
  };
}

function availabilityCopy(
  option: { available: boolean; stockLabel?: string | null; immediateAvailableQty?: number | null },
  labels: KitCommercialCopy,
): string | null {
  if (!option.available || option.stockLabel === "out_of_stock") return labels.outOfStock;
  if (option.immediateAvailableQty == null) return null;
  return option.immediateAvailableQty === 1
    ? labels.availableOne
    : labels.availableMany(option.immediateAvailableQty);
}

/** Tope del kit según los componentes ya elegidos. El carrito vuelve a validar. */
export function kitCompositionQuantityCap(input: {
  fallback: number;
  includes?: readonly KitIncludeLineViewModel[] | null;
  slots?: readonly KitChoiceSlotViewModel[] | null;
  selections: Readonly<Record<string, string>>;
}): number {
  const parts: Array<Readonly<Record<string, number>>> = [];
  const push = (part: Readonly<Record<string, number>> | null | undefined, maxQuantity?: number | null) => {
    if (part && Object.keys(part).length > 0) parts.push(part);
    else if (typeof maxQuantity === "number") parts.push({ _: maxQuantity });
  };
  for (const line of input.includes ?? []) {
    if (line.available === false) return 0;
    push(line.kitCapByWarehouse, line.maxQuantity);
  }
  for (const slot of input.slots ?? []) {
    const selected = input.selections[slot.slotId];
    if (!selected) continue;
    const option = slot.options.find((item) => item.variantId === selected);
    if (!option || option.available === false) return 0;
    push(option.kitCapByWarehouse, option.maxQuantity);
  }
  if (parts.length === 0) return input.fallback;
  const warehouses = [...new Set(parts.flatMap((part) => Object.keys(part)))];
  const cap = warehouses.reduce((total, warehouseId) => {
    const warehouseCap = parts.reduce(
      (min, part) => Math.min(min, part[warehouseId] ?? 0),
      Number.POSITIVE_INFINITY,
    );
    return total + (Number.isFinite(warehouseCap) ? warehouseCap : 0);
  }, 0);
  return Math.max(0, Math.min(input.fallback, cap));
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

export function KitChoiceFields({
  slots,
  value,
  onChange,
  labels,
}: {
  slots?: readonly KitChoiceSlotViewModel[] | null;
  value: Readonly<Record<string, string>>;
  onChange: (slotId: string, variantId: string) => void;
  labels: KitCommercialCopy;
}) {
  if (!slots || slots.length === 0) return null;
  return (
    <div className="space-y-4">
      {slots.map((slot) => (
        <div key={slot.slotId}>
          <p className="text-sm text-primary">
            {slot.label} × {slot.quantity}
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{labels.choose}</p>
          <div role="radiogroup" aria-label={slot.label} className="mt-2 space-y-2">
            {slot.options.map((option) => {
              const selected = value[slot.slotId] === option.variantId;
              const stock = availabilityCopy(option, labels);
              return (
                <button
                  key={option.variantId}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!option.available}
                  data-testid="kit-choice-option"
                  data-selected={selected ? "true" : "false"}
                  className={`flex min-h-11 w-full items-center gap-3 border px-3 py-2 text-left text-sm ${
                    selected ? "border-primary text-primary" : "border-border text-primary"
                  } disabled:cursor-not-allowed disabled:text-muted`}
                  onClick={() => {
                    if (!option.available) return;
                    onChange(slot.slotId, option.variantId);
                  }}
                >
                  <span
                    aria-hidden
                    className={`h-4 w-4 shrink-0 rounded-full border ${selected ? "border-primary bg-primary" : "border-border"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block">{option.label}</span>
                    {stock ? <span className="block text-xs text-muted">{stock}</span> : null}
                  </span>
                  {option.displayPrice ? <span className="shrink-0 text-xs text-muted">{option.displayPrice}</span> : null}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-xs text-muted">{labels.catalogPrice}</p>
        </div>
      ))}
    </div>
  );
}

export function KitComposition({
  includes,
  slots,
  value,
  onChange,
  labels,
}: {
  includes?: readonly KitIncludeLineViewModel[] | null;
  slots?: readonly KitChoiceSlotViewModel[] | null;
  value: Readonly<Record<string, string>>;
  onChange: (slotId: string, variantId: string) => void;
  labels: KitCommercialCopy;
}) {
  const hasIncludes = Boolean(includes && includes.length > 0);
  const hasChoices = Boolean(slots && slots.length > 0);
  if (!hasIncludes && !hasChoices) return null;
  return (
    <section className="mt-4" data-testid="kit-composition">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{labels.includes}</p>
      {hasIncludes ? (
        <ul className="mt-2 space-y-2">
          {includes?.map((line) => (
            <li key={`${line.label}-${line.quantity}`} className="text-sm text-primary" data-testid="kit-fixed-line">
              <span>
                {line.label} × {line.quantity}
              </span>
              {line.available === false ? (
                <span className="ml-2 text-xs text-muted">{labels.outOfStock}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {hasChoices ? (
        <div className="mt-3">
          <KitChoiceFields slots={slots} value={value} onChange={onChange} labels={labels} />
        </div>
      ) : null}
    </section>
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
