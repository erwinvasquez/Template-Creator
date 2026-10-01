"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import type {
  ProductDetailViewModel,
  ProductDetailViewProps,
  ProductVariantViewModel,
  StockLabel,
} from "@shopenlinea/commerce-runtime-contract";
import {
  buildOptionDimensions,
  chipStateForOptionValue,
  resolveVariantForDimensionSelection,
  selectionsFromVariant,
  valuesForDimension,
  type VariantOptionLike,
  resolveStockToMtoTransition,
  shouldOpenStockToMtoModal,
  stockCap,
} from "@shopenlinea/commerce-runtime-contract";
import { useSiteContent } from "../../lib/site-content";
import { requireUi } from "../../lib/ui";
import { withBasePath } from "../../content/resolve";
import { CommerceProductCard } from "./CommerceProductCard";
import { MadeToOrderUpsellDialog } from "./MadeToOrderUpsellDialog";
import { isPdpFieldVisible } from "../../lib/pdp-presentation";

function parseDisplayPrice(display: string): number | null {
  const n = Number(display.replace(/[^\d,.-]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function discountPercent(price: string, compareAt: string): number | null {
  const p = parseDisplayPrice(price);
  const c = parseDisplayPrice(compareAt);
  if (p == null || c == null || c <= p || c <= 0) return null;
  return Math.floor(((c - p) / c) * 100);
}

function badgeLabel(
  key: string,
  labels: Record<string, string>,
): string {
  return labels[key] ?? key;
}

function stockCopy(
  label: StockLabel | null | undefined,
  ui: {
    outOfStock: string;
    contact: string;
    lowStock: string;
  },
): string | null {
  if (!label || label === "available") return null;
  if (label === "out_of_stock") return ui.outOfStock;
  if (label === "contact") return ui.contact;
  return null;
}

function toPickerVariants(product: ProductDetailViewModel): VariantOptionLike[] {
  return product.variants.map((v) => ({
    id: v.id,
    optionValues: v.options.map((o) => ({ option: o.name, value: o.value })),
  }));
}

function buildMaxAddQtyMap(product: ProductDetailViewModel): Record<string, number> {
  const map: Record<string, number> = {};
  for (const v of product.variants) {
    const maxQty = v.maxQuantity ?? 0;
    map[v.id] = v.available && maxQty > 0 ? maxQty : 0;
  }
  return map;
}

function selectionsFromSelectedVariant(
  pickerVariants: VariantOptionLike[],
  selectedId: string | undefined,
): Record<string, string> {
  const variant = pickerVariants.find((v) => v.id === selectedId);
  return selectionsFromVariant(variant);
}

/** Academia: solo Modalidad es pickable; duración/nivel son informativos. */
function pickableDimensions(
  pickerVariants: VariantOptionLike[],
  optionDefinitions?: ProductDetailViewModel["optionDefinitions"],
): string[] {
  const all = buildOptionDimensions(pickerVariants, optionDefinitions);
  const modality = all.filter((d) => d === "Modalidad");
  const base = modality.length ? modality : all.slice(0, 1);
  return base.filter((d) => valuesForDimension(pickerVariants, d).length > 1);
}

function optionValue(
  variant: ProductVariantViewModel | undefined,
  name: string,
): string | null {
  return variant?.options.find((o) => o.name === name)?.value ?? null;
}

export function ProductDetailCommerceView({
  product,
  capabilities,
  actions,
  errorMessage,
}: ProductDetailViewProps) {
  const { payload, basePath } = useSiteContent();
  const ui = requireUi(payload);
  const uiProduct = ui.product;
  const madeToOrderUi = ui.salesMode.madeToOrder;
  const presentation = payload.sections?.product?.presentation;
  const uiBadges = {
    ...uiProduct.badges,
    limitedEdition: uiProduct.badges.limitedEdition,
  };
  const relatedTitle = uiProduct.relatedTitle;
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [upsellOpen, setUpsellOpen] = useState(false);

  const selected =
    product.variants.find((v) => v.id === product.selectedVariantId) ??
    product.variants[0];

  const shopLabel =
    payload.navigation.primary.find(
      (l) =>
        (l.type === "path" && l.href.startsWith("/catalogo")) ||
        l.type === "shopFilter",
    )?.label ?? "Programas";

  const pickerVariants = useMemo(
    () => toPickerVariants(product),
    [product.variants],
  );
  const dimensions = useMemo(
    () => pickableDimensions(pickerVariants, product.optionDefinitions),
    [pickerVariants, product.optionDefinitions],
  );
  const maxAddQtyMap = useMemo(
    () => buildMaxAddQtyMap(product),
    [product.variants],
  );
  const selections = useMemo(
    () => selectionsFromSelectedVariant(pickerVariants, selected?.id),
    [pickerVariants, selected?.id],
  );

  const showModalities =
    capabilities.variantSelector !== "unsupported" && dimensions.length > 0;

  const stockCapQty = stockCap(selected, product);
  const transition = resolveStockToMtoTransition(product, selected, quantity);
  const showInlineMto = transition?.kind === "immediateExhausted";
  const upsell = product.madeToOrderUpsell;
  const nextQtyTransition = useMemo(
    () => resolveStockToMtoTransition(product, selected, quantity + 1),
    [product, selected, quantity],
  );
  const stockLabel = selected?.stockLabel ?? product.stockLabel ?? null;
  const variantAvailable = selected?.available !== false;
  const canBuy =
    Boolean(selected) &&
    product.canAddToCart &&
    variantAvailable &&
    !product.madeToOrderClosed &&
    stockLabel !== "out_of_stock" &&
    !showInlineMto &&
    stockCapQty > 0;

  const pct =
    selected?.compareAtPrice && selected.displayPrice
      ? discountPercent(selected.displayPrice, selected.compareAtPrice)
      : null;

  const isBook = product.categoryLabels?.some((c) =>
    /libro/i.test(c),
  );

  const modality = optionValue(selected, "Modalidad");
  const duration = optionValue(selected, "Duración");
  const level = optionValue(selected, "Nivel");

  const metaChips = useMemo(() => {
    const chips: string[] = [];
    if (isPdpFieldVisible(presentation, "categoryLabels")) {
      chips.push(...(product.categoryLabels ?? []));
    }
    if (modality) chips.push(modality);
    if (duration) chips.push(duration);
    if (level) chips.push(level);
    return chips.filter((v, i, arr) => arr.indexOf(v) === i);
  }, [
    presentation,
    product.categoryLabels,
    modality,
    duration,
    level,
  ]);

  const heroEyebrow = useMemo(() => {
    if (
      isPdpFieldVisible(presentation, "collectionLabels") &&
      product.collectionLabels?.[0]
    ) {
      return product.collectionLabels[0];
    }
    if (
      isPdpFieldVisible(presentation, "categoryLabels") &&
      product.categoryLabels?.[0]
    ) {
      return product.categoryLabels[0];
    }
    return presentation ? null : "Programa Voxa";
  }, [presentation, product.collectionLabels, product.categoryLabels]);

  const mainImage =
    product.gallery[galleryIndex] ?? product.gallery[0] ?? null;

  useEffect(() => {
    setQuantity(1);
    setLocalError(null);
    setGalleryIndex(0);
  }, [product.id, selected?.id]);

  async function onAdd() {
    if (!selected || !canBuy) return;
    const t = resolveStockToMtoTransition(product, selected, quantity);
    if (t && shouldOpenStockToMtoModal(t)) {
      setUpsellOpen(true);
      return;
    }
    setPending(true);
    setLocalError(null);
    try {
      const res = await actions.addToCart(selected.id, quantity);
      if (!res.ok) {
        setLocalError(res.errorMessage ?? ui.errors.addToCartFailed);
        return;
      }
      actions.confirmAddToCartSuccess(selected.id);
    } finally {
      setPending(false);
    }
  }

  function onIncrementQuantity() {
    const tInc = resolveStockToMtoTransition(product, selected, quantity + 1);
    if (tInc && shouldOpenStockToMtoModal(tInc)) {
      setUpsellOpen(true);
      return;
    }
    setQuantity((q) => Math.min(stockCapQty, q + 1));
  }

  const stockMessage = stockCopy(stockLabel, {
    outOfStock: uiProduct.outOfStock,
    contact: uiProduct.contact,
    lowStock: uiProduct.lowStock,
  });

  const ctaLabel = pending
    ? uiProduct.addingToCart
    : stockLabel === "out_of_stock" || !variantAvailable
      ? uiProduct.outOfStock
      : isBook
        ? uiProduct.addToCart
        : uiProduct.addToCart;

  return (
    <div className="pb-28 md:pb-24">
      {/* Hero editorial */}
      <div className="relative overflow-hidden border-b border-border bg-ink">
        <div className="absolute inset-0">
          {mainImage?.url ? (
            <Image
              src={mainImage.url}
              alt={mainImage.alt ?? product.name}
              fill
              priority
              className="object-cover opacity-55 animate-soft-zoom"
              sizes="100vw"
            />
          ) : null}
          <div className="voxa-hero-scrim absolute inset-0" />
          <div className="voxa-hero-aura absolute inset-0" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-10 md:px-10 md:pb-20 md:pt-14">
          <nav
            className="mb-8 text-[11px] font-medium uppercase tracking-[0.16em] text-white/65 animate-fade-in"
            aria-label="Breadcrumb"
          >
            <Link
              href={withBasePath(basePath, "/catalogo")}
              className="cursor-pointer transition-colors duration-200 hover:text-white"
            >
              {shopLabel}
            </Link>
            <span className="mx-2 text-white/35">/</span>
            <span className="text-white/90">{product.name}</span>
          </nav>

          <div className="grid min-w-0 items-end gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-7 animate-fade-up">
              {isPdpFieldVisible(presentation, "badges") &&
              product.badges &&
              product.badges.length > 0 ? (
                <p className="mb-4 flex flex-wrap gap-2">
                  {product.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-background"
                    >
                      {badgeLabel(b, uiBadges)}
                    </span>
                  ))}
                </p>
              ) : null}

              {heroEyebrow ? (
                <p className="voxa-rule text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
                  {heroEyebrow}
                </p>
              ) : null}

              <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.1] text-balance text-white md:text-6xl">
                {product.name}
              </h1>

              {isPdpFieldVisible(presentation, "shortDescription") &&
              product.shortDescription ? (
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                  {product.shortDescription}
                </p>
              ) : null}

              {metaChips.length > 0 ? (
                <div className="mt-8 flex flex-wrap gap-2">
                  {metaChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Panel de inscripción */}
            <aside className="min-w-0 lg:col-span-5 animate-fade-up [animation-delay:120ms]">
              <div className="rounded-2xl border border-white/15 bg-white/95 p-6 shadow-[0_24px_60px_rgba(11,18,32,0.35)] backdrop-blur-md md:p-8">
                <div className="flex flex-wrap items-baseline gap-3">
                  <p className="font-serif text-3xl text-primary md:text-4xl">
                    {selected?.displayPrice ??
                      product.variants[0]?.displayPrice}
                  </p>
                  {selected?.compareAtPrice ? (
                    <p className="text-sm text-muted line-through">
                      {selected.compareAtPrice}
                    </p>
                  ) : null}
                  {pct != null && pct > 0 ? (
                    <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">
                      −{pct}%
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-sm text-muted">
                  {isBook ? uiProduct.priceBookLabel : uiProduct.priceProgramLabel}
                </p>

                {showModalities
                  ? dimensions.map((dimension, dimensionIndex) => {
                      const values = valuesForDimension(
                        pickerVariants,
                        dimension,
                      );
                      return (
                        <div key={dimension} className="mt-6 space-y-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
                            {dimension}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {values.map((val) => {
                              const state = chipStateForOptionValue(
                                pickerVariants,
                                dimensions,
                                selections,
                                dimensionIndex,
                                val,
                                maxAddQtyMap,
                              );
                              const disabled =
                                state === "impossible" || state === "soldOut";
                              const active =
                                state === "selected" ||
                                state === "selectedSoldOut";
                              const soldOutChip =
                                state === "soldOut" ||
                                state === "selectedSoldOut";
                              return (
                                <button
                                  key={val}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => {
                                    const resolved =
                                      resolveVariantForDimensionSelection(
                                        pickerVariants,
                                        dimensions,
                                        selections,
                                        dimensionIndex,
                                        val,
                                        {
                                          maxAddQtyByVariantId: maxAddQtyMap,
                                          preferredVariantId: selected?.id,
                                        },
                                      );
                                    if (resolved) {
                                      actions.selectVariant(resolved.id);
                                    }
                                  }}
                                  className={`cursor-pointer rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                                    soldOutChip ? "line-through opacity-60" : ""
                                  } ${
                                    active
                                      ? "border-primary bg-primary text-background"
                                      : "border-border text-primary hover:border-cta hover:text-primary"
                                  }`}
                                >
                                  {val}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  : null}

                {isPdpFieldVisible(presentation, "stockMessage") &&
                capabilities.stockIndicator !== "unsupported" &&
                stockMessage ? (
                  <p className="mt-5 text-sm text-muted">{stockMessage}</p>
                ) : null}

                {product.madeToOrderClosed ? (
                  <p className="mt-5 text-sm text-muted">
                    {uiProduct.madeToOrderClosed}
                    {product.madeToOrderReopensAtLabel
                      ? ` ${madeToOrderUi.reopensPrefix} ${product.madeToOrderReopensAtLabel}`
                      : ""}
                  </p>
                ) : null}


          {showInlineMto && upsell ? (
            <div className="mt-10 rounded-lg border border-border bg-surface/60 p-6 md:p-8">
              <p className="text-sm font-medium text-primary">
                {uiProduct.stockExhaustedImmediateTitle}
              </p>
              <p className="mt-2 text-sm text-muted">
                {uiProduct.stockExhaustedMadeToOrderAvailable}
              </p>
              {upsell.preparationPromiseLabel ? (
                <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  {madeToOrderUi.preparationLabel}: {upsell.preparationPromiseLabel}
                </p>
              ) : null}
              <Link
                href={withBasePath(
                  basePath,
                  upsell.productHref.startsWith("/")
                    ? upsell.productHref
                    : `/${upsell.productHref}`,
                )}
                className="mt-6 inline-block cursor-pointer bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-colors duration-200 hover:bg-primary/90"
              >
                {uiProduct.buyMadeToOrderCta}
              </Link>
            </div>
          ) : null}

                {!showInlineMto && canBuy ? (
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                      {isBook ? "Cantidad" : "Plazas"}
                    </p>
                    <div className="flex items-center overflow-hidden rounded-full border border-border">
                      <button
                        type="button"
                        className="cursor-pointer p-3 transition-colors hover:bg-surface disabled:opacity-40"
                        disabled={quantity <= 1 || pending}
                        onClick={() =>
                          setQuantity((q) => Math.max(1, q - 1))
                        }
                        aria-label="Menos"
                      >
                        <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <span className="w-10 text-center text-sm tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="cursor-pointer p-3 transition-colors hover:bg-surface disabled:opacity-40"
                        disabled={
                        (quantity >= stockCapQty && !(nextQtyTransition && shouldOpenStockToMtoModal(nextQtyTransition))) ||
                        pending
                      }
                      onClick={onIncrementQuantity}
                        aria-label="Más"
                      >
                        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ) : null}

                {!showInlineMto ? (
                  <>
                <button
                  type="button"
                  disabled={!canBuy || pending}
                  onClick={onAdd}
                  className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-background transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ctaLabel}
                  {!pending && canBuy ? (
                    <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                  ) : null}
                </button>

                {(errorMessage || localError) && (
                  <p className="mt-3 text-sm text-red-700" role="alert">
                    {localError ?? errorMessage}
                  </p>
                )}

                {isPdpFieldVisible(presentation, "preparationPromise") &&
                product.preparationPromiseLabel ? (
                  <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                    {madeToOrderUi.preparationLabel}: {product.preparationPromiseLabel}
                  </p>
                ) : null}
                  </>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Galería secundaria (sesión / entorno) */}
      {product.gallery.length > 1 ? (
        <div className="border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-6 py-5 md:px-10 min-w-0">
            <div className="w-full min-w-0 overflow-x-auto">
              <div className="flex gap-3">
                {product.gallery.map((g, i) => {
                  const active = i === galleryIndex;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGalleryIndex(i)}
                      className={`relative h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-colors duration-200 ${
                        active
                          ? "border-cta"
                          : "border-transparent hover:border-border"
                      }`}
                      aria-label={`Imagen ${i + 1}`}
                    >
                      <Image
                        src={g.url}
                        alt={g.alt ?? ""}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Contenido del programa */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 animate-fade-up">
            <p className="voxa-rule text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
              {isBook ? "Sobre el libro" : "Sobre el programa"}
            </p>
            {isPdpFieldVisible(presentation, "description") &&
            product.description ? (
              <p className="mt-4 text-base leading-relaxed text-primary md:text-lg">
                {product.description}
              </p>
            ) : null}

            {isPdpFieldVisible(presentation, "bulletPoints") &&
            product.bulletPoints &&
            product.bulletPoints.length > 0 ? (
              <ul className="mt-8 space-y-3">
                {product.bulletPoints.map((b) => (
                  <li
                    key={b}
                    className="flex gap-3 text-sm leading-relaxed text-muted md:text-base"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-secondary">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="lg:col-span-5 animate-fade-up [animation-delay:100ms]">
            {isPdpFieldVisible(presentation, "highlights") &&
            product.highlights &&
            product.highlights.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border bg-white">
                <div className="border-b border-border bg-surface px-6 py-4">
                  <h2 className="font-serif text-xl text-primary">
                    {isBook ? "Ficha" : "Datos del programa"}
                  </h2>
                </div>
                <ul className="divide-y divide-border">
                  {product.highlights.map((h, i) => (
                    <li
                      key={h}
                      className="flex gap-4 px-6 py-4 text-sm text-primary"
                    >
                      <span className="font-serif text-lg text-secondary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {((isPdpFieldVisible(presentation, "specifications") &&
              product.specifications?.length) ||
              (isPdpFieldVisible(presentation, "brandLabel") &&
                product.brandLabel)) && (
              <dl className="mt-6 space-y-3 rounded-xl border border-border bg-white px-6 py-5 text-sm">
                {isPdpFieldVisible(presentation, "brandLabel") &&
                product.brandLabel ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Academia</dt>
                    <dd className="text-right text-primary">
                      {product.brandLabel}
                    </dd>
                  </div>
                ) : null}
                {isPdpFieldVisible(presentation, "specifications") &&
                  product.specifications?.map((s) => (
                  <div key={s.key} className="flex justify-between gap-4">
                    <dt className="text-muted">{s.key}</dt>
                    <dd className="text-right text-primary">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      {isPdpFieldVisible(presentation, "relatedProducts") &&
      capabilities.relatedProducts !== "unsupported" &&
      product.relatedProducts &&
      product.relatedProducts.length > 0 && (
          <section className="border-t border-border bg-surface py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
              <p className="voxa-rule text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
                Continúa el itinerario
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-wide text-primary md:text-4xl">
                {relatedTitle}
              </h2>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {product.relatedProducts.map((p) => (
                  <CommerceProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      {product.madeToOrderUpsell ? (
        <MadeToOrderUpsellDialog
          open={upsellOpen}
          onClose={() => setUpsellOpen(false)}
          basePath={basePath}
          upsell={product.madeToOrderUpsell}
          immediateFulfillmentQty={stockCapQty}
          stockUpsellModalTitle={uiProduct.stockUpsellModalTitle}
          stockInsufficientImmediate={uiProduct.stockInsufficientImmediate}
          stockInsufficientMadeToOrderHint={
            uiProduct.stockInsufficientMadeToOrderHint
          }
          preparationLabel={madeToOrderUi.preparationLabel}
          preparationPromiseLabel={product.preparationPromiseLabel}
          buyMadeToOrderCta={uiProduct.buyMadeToOrderCta}
          dismissLabel={ui.chrome.closeMenu}
        />
      ) : null}
    </div>
  );
}
