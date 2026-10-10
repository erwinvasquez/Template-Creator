"use client";

import { useEffect, useId, useRef, useState } from "react";
import type {
  KitChoiceOptionViewModel,
  KitChoiceSlotViewModel,
  KitIncludeLineViewModel,
  KitSavingsViewModel,
} from "@shopenlinea/commerce-runtime-contract";

import type { KitCommercialCopy } from "./kitCommercialCopy";
import { kitCommercialCopy } from "./kitCommercialCopy";

export type { KitCommercialCopy };
export { kitCommercialCopy };

function splitCommercialLabel(label: string): { name: string; detail: string | null } {
  const separator = " — ";
  const index = label.indexOf(separator);
  if (index <= 0) return { name: label, detail: null };
  return { name: label.slice(0, index), detail: label.slice(index + separator.length) };
}

function customerOptionLabel(slotLabel: string, optionLabel: string): string {
  const prefix = `${slotLabel.trim()} — `;
  return optionLabel.startsWith(prefix) ? optionLabel.slice(prefix.length) : optionLabel;
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
      <ul className="mt-2 space-y-2 text-sm text-primary">
        {includes.map((line) => {
          const [name, ...rest] = line.label.split(" — ");
          const detail = rest.join(" — ");
          return (
            <li key={`${line.label}-${line.quantity}`}>
              <span className="block">{name}</span>
              <span className="block text-muted">
                {detail ? `${detail} × ${line.quantity}` : `× ${line.quantity}`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ChoiceOptionControl({
  option,
  slotLabel,
  selected,
  role,
  labels,
  onSelect,
}: {
  option: KitChoiceOptionViewModel;
  slotLabel: string;
  selected: boolean;
  role: "radio" | "option";
  labels: KitCommercialCopy;
  onSelect: () => void;
}) {
  const label = customerOptionLabel(slotLabel, option.label);
  return (
    <button
      type="button"
      role={role}
      aria-checked={role === "radio" ? selected : undefined}
      aria-selected={role === "option" ? selected : undefined}
      disabled={!option.available}
      data-testid="kit-choice-option"
      data-selected={selected ? "true" : "false"}
      className={`flex min-h-11 w-full min-w-0 items-center gap-3 border px-3 py-2 text-left text-sm text-primary disabled:cursor-not-allowed disabled:text-muted ${
        selected ? "border-primary" : "border-border"
      }`}
      onClick={() => {
        if (!option.available) return;
        onSelect();
      }}
    >
      <span
        aria-hidden
        className={`h-4 w-4 shrink-0 rounded-full border ${selected ? "border-primary bg-primary" : "border-border"}`}
      />
      <span className="min-w-0 flex-1 break-words">{label}</span>
      {!option.available ? <span className="shrink-0 text-xs text-muted">{labels.outOfStock}</span> : null}
    </button>
  );
}

function KitChoiceMenu({
  slot,
  value,
  onChange,
  labels,
}: {
  slot: KitChoiceSlotViewModel;
  value: Readonly<Record<string, string>>;
  onChange: (slotId: string, variantId: string) => void;
  labels: KitCommercialCopy;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = slot.options.find((option) => option.variantId === value[slot.slotId]);
  const closedLabel = selected ? customerOptionLabel(slot.label, selected.label) : labels.choosePrompt;

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} data-testid="kit-choice-menu" className="relative min-w-0 max-w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 border border-border bg-background px-3 text-left text-sm text-primary"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="min-w-0 break-words">{closedLabel}</span>
      </button>
      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label={slot.label}
          className="absolute z-10 mt-1 max-h-60 w-full min-w-0 overflow-auto border border-border bg-background"
        >
          {slot.options.map((option) => (
            <ChoiceOptionControl
              key={option.variantId}
              option={option}
              slotLabel={slot.label}
              selected={option.variantId === value[slot.slotId]}
              role="option"
              labels={labels}
              onSelect={() => {
                onChange(slot.slotId, option.variantId);
                setOpen(false);
              }}
            />
          ))}
        </div>
      ) : null}
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
        <div key={slot.slotId} data-testid="kit-choice-slot" className="min-w-0 max-w-full">
          <p className="text-sm text-primary">
            {slot.label} × {slot.quantity}
          </p>
          <div data-testid="kit-choice-options" className="mt-2 min-w-0 max-w-full pl-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{labels.choose}</p>
            {slot.options.length > 3 ? (
              <div className="mt-2">
                <KitChoiceMenu slot={slot} value={value} onChange={onChange} labels={labels} />
              </div>
            ) : (
              <div role="radiogroup" aria-label={slot.label} className="mt-2 space-y-2">
                {slot.options.map((option) => (
                  <ChoiceOptionControl
                    key={option.variantId}
                    option={option}
                    slotLabel={slot.label}
                    selected={value[slot.slotId] === option.variantId}
                    role="radio"
                    labels={labels}
                    onSelect={() => onChange(slot.slotId, option.variantId)}
                  />
                ))}
              </div>
            )}
          </div>
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
          {includes?.map((line) => {
            const parts = splitCommercialLabel(line.label);
            return (
              <li key={`${line.label}-${line.quantity}`} className="text-sm text-primary" data-testid="kit-fixed-line">
                <p>{parts.name}</p>
                <p>
                  {parts.detail ? `${parts.detail} × ${line.quantity}` : `× ${line.quantity}`}
                </p>
                {line.available === false ? <p className="text-xs text-muted">{labels.outOfStock}</p> : null}
              </li>
            );
          })}
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
