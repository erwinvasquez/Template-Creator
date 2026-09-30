"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import type {
  ProductDetailViewModel,
  ProductDetailViewProps,
  StockLabel,
} from "@shopenlinea/commerce-runtime-contract";
import {
  buildOptionDimensions,
  canUseVariantOptionPickers,
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

function discountPercent(
  price: string,
  compareAt: string,
): number | null {
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
  if (label === "low_stock") return ui.lowStock;
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

export function ProductDetailCommerceView({
  product,
  capabilities,
  actions,
  errorMessage,
}: ProductDetailViewProps) {
  const { payload, basePath } = useSiteContent();
  const ui = requireUi(payload);
  const uiProduct = ui.product;
  const uiBadges = uiProduct.badges;
  const madeToOrderUi = ui.salesMode.madeToOrder;
  const presentation = payload.sections?.product?.presentation;
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryManual, setGalleryManual] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);

  const selected =
    product.variants.find((v) => v.id === product.selectedVariantId) ??
    product.variants[0];

  const relatedTitle = uiProduct.relatedTitle;
  const shopLabel = payload.navigation.primary.find(
    (l) =>
      (l.type === "path" && l.href.startsWith("/tienda")) ||
      l.type === "shopFilter",
  )?.label;

  const metaChips = useMemo(() => {
    const chips: string[] = [];
    if (isPdpFieldVisible(presentation, "categoryLabels")) {
      chips.push(...(product.categoryLabels ?? []));
    }
    if (isPdpFieldVisible(presentation, "collectionLabels")) {
      chips.push(...(product.collectionLabels ?? []));
    }
    return chips;
  }, [
    presentation,
    product.categoryLabels,
    product.collectionLabels,
  ]);

  const specItems = useMemo(
    () => [
      ...(product.highlights ?? []),
      ...(product.keyFeatures ?? []),
    ],
    [product.highlights, product.keyFeatures],
  );

  const pickerVariants = useMemo(
    () => toPickerVariants(product),
    [product.variants],
  );
  const dimensions = useMemo(
    () => buildOptionDimensions(pickerVariants, product.optionDefinitions),
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
  const usePickers = useMemo(
    () => canUseVariantOptionPickers(pickerVariants),
    [pickerVariants],
  );

  const showVariants =
    capabilities.variantSelector !== "unsupported" &&
    product.variants.length > 1;

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

  const mainImage = useMemo(() => {
    if (!galleryManual && selected?.imageUrl) {
      const match = product.gallery.find((g) => g.url === selected.imageUrl);
      if (match) return match;
      return {
        id: "variant",
        url: selected.imageUrl,
        alt: product.name,
      };
    }
    return product.gallery[galleryIndex] ?? product.gallery[0] ?? null;
  }, [
    galleryManual,
    selected,
    product.gallery,
    product.name,
    galleryIndex,
  ]);

  useEffect(() => {
    setQuantity(1);
    setLocalError(null);
    setGalleryManual(false);
    if (selected) {
      if (selected.imageUrl) {
        const idx = product.gallery.findIndex((g) => g.url === selected.imageUrl);
        if (idx >= 0) setGalleryIndex(idx);
      } else {
        setGalleryIndex(0);
      }
    }
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      actions.openCartDrawer();
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

  const variantChipClass = (active: boolean) =>
    `cursor-pointer border-2 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
      active
        ? "border-cta bg-primary text-background"
        : "border-border text-primary hover:border-primary"
    }`;

  return (
    <div className="min-w-0 pb-24 pt-28 md:pt-32">
      <div className="mx-auto min-w-0 max-w-7xl px-6 md:px-8">
        {shopLabel ? (
          <nav
            className="mb-8 text-[11px] font-bold uppercase tracking-[0.2em] text-muted"
            aria-label="Breadcrumb"
          >
            <Link
              href={withBasePath(basePath, "/tienda")}
              className="cursor-pointer transition-colors duration-200 hover:text-primary"
            >
              {shopLabel}
            </Link>
            <span className="mx-2 text-border">/</span>
            <span className="text-primary">{product.name}</span>
          </nav>
        ) : null}

        <div className="grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-14 lg:items-start">
          {/* Gallery — gear showcase */}
          <div className="min-w-0 w-full max-w-full lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden border-2 border-primary bg-surface">
              {mainImage?.url && (
                <Image
                  src={mainImage.url}
                  alt={mainImage.alt ?? product.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              {isPdpFieldVisible(presentation, "badges") &&
              product.badges &&
              product.badges.length > 0 ? (
                <div className="absolute left-0 top-0 flex flex-wrap gap-px">
                  {product.badges.map((b) => (
                    <span
                      key={b}
                      className="bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-background"
                    >
                      {badgeLabel(b, uiBadges)}
                    </span>
                  ))}
                </div>
              ) : null}
              {pct != null && pct > 0 ? (
                <span className="absolute right-0 top-0 bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-background">
                  −{pct}%
                </span>
              ) : null}
            </div>

            {product.gallery.length > 1 ? (
              <div className="category-scroll mt-3 w-full min-w-0 overflow-x-auto pb-1">
                <ul className="flex gap-2">
                  {product.gallery.map((g, i) => {
                    const active = mainImage?.id === g.id || i === galleryIndex;
                    return (
                      <li key={g.id} className="shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setGalleryIndex(i);
                            setGalleryManual(true);
                          }}
                          className={`relative h-[4.5rem] w-16 cursor-pointer overflow-hidden border-2 bg-surface transition-colors duration-200 ${
                            active
                              ? "border-cta"
                              : "border-border hover:border-primary"
                          }`}
                          aria-label={`Imagen ${i + 1}`}
                        >
                          <Image
                            src={g.url}
                            alt={g.alt ?? ""}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Purchase column — performance panel */}
          <div className="min-w-0 border-2 border-primary bg-background">
            <div className="h-1.5 w-full bg-primary" aria-hidden />

            <div className="p-6 md:p-8">
              {metaChips.length > 0 ? (
                <div className="mb-5 flex flex-wrap gap-2">
                  {metaChips.map((chip) => (
                    <span
                      key={chip}
                      className="border border-border bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-secondary"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}

              <h1 className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-primary md:text-5xl">
                {product.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-baseline gap-3 border-b border-border pb-6">
                <p className="font-display text-3xl font-bold tracking-tight text-primary">
                  {selected?.displayPrice ?? product.variants[0]?.displayPrice}
                </p>
                {selected?.compareAtPrice ? (
                  <p className="text-sm font-medium text-muted line-through">
                    {selected.compareAtPrice}
                  </p>
                ) : null}
              </div>

              {isPdpFieldVisible(presentation, "shortDescription") &&
              product.shortDescription ? (
                <p className="mt-5 text-sm font-medium leading-relaxed text-primary md:text-base">
                  {product.shortDescription}
                </p>
              ) : null}

              {isPdpFieldVisible(presentation, "description") &&
              product.description ? (
                <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                  {product.description}
                </p>
              ) : null}

              {isPdpFieldVisible(presentation, "highlights") &&
              specItems.length > 0 ? (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {specItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 border border-border bg-surface/60 px-3 py-2.5 text-sm text-primary"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {isPdpFieldVisible(presentation, "bulletPoints") &&
              product.bulletPoints &&
              product.bulletPoints.length > 0 ? (
                <ul className="mt-4 space-y-1.5 border-l-2 border-cta pl-4 text-sm text-muted">
                  {product.bulletPoints.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}

              {showVariants && usePickers ? (
                <div className="mt-8 space-y-6 border-t border-border pt-6">
                  {dimensions.map((dimension, dimensionIndex) => {
                    const values = valuesForDimension(pickerVariants, dimension);
                    return (
                      <div key={dimension} className="space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
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
                              state === "selected" || state === "selectedSoldOut";
                            const soldOutChip =
                              state === "soldOut" || state === "selectedSoldOut";
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
                                className={`cursor-pointer border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                  soldOutChip ? "line-through opacity-60" : ""
                                } ${
                                  active
                                    ? "border-cta bg-primary text-background"
                                    : "border-border bg-background text-primary hover:border-cta hover:text-primary"
                                }`}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

          {showVariants && !usePickers ? (
                <div className="mt-8 space-y-3 border-t border-border pt-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                    Variante
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!v.available}
                        onClick={() => actions.selectVariant(v.id)}
                        className={variantChipClass(selected?.id === v.id)}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {isPdpFieldVisible(presentation, "stockMessage") &&
              capabilities.stockIndicator !== "unsupported" &&
              stockMessage ? (
                <p className="mt-5 text-sm font-medium text-secondary">{stockMessage}</p>
              ) : null}

              {product.madeToOrderClosed ? (
                <p className="mt-4 text-sm text-muted">
                  {uiProduct.madeToOrderClosed}
                  {product.madeToOrderReopensAtLabel
                    ? ` ${madeToOrderUi.reopensPrefix} ${product.madeToOrderReopensAtLabel}`
                    : ""}
                </p>
              ) : null}

              {!showInlineMto ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                {canBuy ? (
                  <div className="flex w-full items-stretch border-2 border-primary sm:w-auto">
                    <button
                      type="button"
                      className="cursor-pointer px-4 py-3.5 transition-colors duration-200 hover:bg-surface disabled:opacity-40"
                      disabled={quantity <= 1 || pending}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Menos"
                    >
                      <Minus className="h-4 w-4" strokeWidth={2} />
                    </button>
                    <span className="flex min-w-[3rem] items-center justify-center border-x-2 border-primary text-sm font-bold tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="cursor-pointer px-4 py-3.5 transition-colors duration-200 hover:bg-surface disabled:opacity-40"
                      disabled={
                    (quantity >= stockCapQty && !(nextQtyTransition && shouldOpenStockToMtoModal(nextQtyTransition))) || pending
                  }
                  onClick={onIncrementQuantity}
                      aria-label="Más"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                ) : null}

                <button
                  type="button"
                  disabled={!canBuy || pending}
                  onClick={onAdd}
                  className="w-full flex-1 cursor-pointer bg-primary px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-background transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending
                    ? uiProduct.addingToCart
                    : stockLabel === "out_of_stock" || !variantAvailable
                      ? uiProduct.outOfStock
                      : uiProduct.addToCart}
                </button>
              </div>
              ) : null}

              {!showInlineMto && (errorMessage || localError) && (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  {localError ?? errorMessage}
                </p>
              )}

              {!showInlineMto &&
              isPdpFieldVisible(presentation, "preparationPromise") &&
              product.preparationPromiseLabel ? (
                <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  {madeToOrderUi.preparationLabel}: {product.preparationPromiseLabel}
                </p>
              ) : null}

              {(isPdpFieldVisible(presentation, "brandLabel") && product.brandLabel) ||
              (isPdpFieldVisible(presentation, "specifications") &&
                product.specifications?.length) ? (
                <dl className="mt-8 space-y-0 border-t-2 border-primary pt-6 text-sm">
                  {isPdpFieldVisible(presentation, "brandLabel") &&
                  product.brandLabel ? (
                    <div className="flex justify-between gap-4 border-b border-border py-3">
                      <dt className="font-bold uppercase tracking-[0.12em] text-muted">
                        Marca
                      </dt>
                      <dd className="font-medium text-primary">
                        {product.brandLabel}
                      </dd>
                    </div>
                  ) : null}
                  {isPdpFieldVisible(presentation, "specifications") &&
                  product.specifications?.map((s) => (
                    <div
                      key={s.key}
                      className="flex justify-between gap-4 border-b border-border py-3"
                    >
                      <dt className="font-bold uppercase tracking-[0.12em] text-muted">
                        {s.key}
                      </dt>
                      <dd className="text-right font-medium text-primary">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {isPdpFieldVisible(presentation, "relatedProducts") &&
      capabilities.relatedProducts !== "unsupported" &&
      product.relatedProducts &&
      product.relatedProducts.length > 0 && (
          <section className="mx-auto mt-20 max-w-7xl border-t-2 border-primary px-6 pt-14 md:px-8">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-primary md:text-4xl">
              {relatedTitle}
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
              {product.relatedProducts.map((p) => (
                <CommerceProductCard key={p.id} product={p} />
              ))}
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
