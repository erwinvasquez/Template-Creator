"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
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
  useProductDetailGalleryVariantSync,
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
  const [upsellOpen, setUpsellOpen] = useState(false);

  const relatedTitle = uiProduct.relatedTitle;
  const shopLabel = payload.navigation.primary.find(
    (l) =>
      (l.type === "path" && l.href.startsWith("/tienda")) ||
      l.type === "shopFilter",
  )?.label;

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
  const {
    activeGalleryIndex: galleryIndex,
    mainImage,
    onGalleryItemClick,
    selectedVariant: selected,
  } = useProductDetailGalleryVariantSync({
    product,
    onSelectVariant: actions.selectVariant,
    pickerVariants,
    dimensions,
    maxAddQtyMap,
  });

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

  useEffect(() => {
    setQuantity(1);
    setLocalError(null);
  }, [selected?.id]);

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

  return (
    <div className="min-w-0 pb-24 pt-28 md:pt-32">
      <div className="mx-auto grid min-w-0 max-w-7xl gap-10 px-6 md:grid-cols-2 md:gap-16 md:px-8">
        <div className="min-w-0 w-full max-w-full">
          <div className="relative aspect-[3/4] overflow-hidden bg-surface">
            {mainImage?.url && (
              <Image
                src={mainImage.url}
                alt={mainImage.alt ?? product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
          {product.gallery.length > 1 ? (
            <div className="mt-3 w-full min-w-0 overflow-x-auto">
              <ul className="flex gap-2 pb-1">
                {product.gallery.map((g, i) => {
                  const active = mainImage?.id === g.id || i === galleryIndex;
                  return (
                    <li key={g.id} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => onGalleryItemClick(i)}
                        className={`relative h-16 w-12 cursor-pointer overflow-hidden border bg-surface transition-colors ${
                          active ? "border-primary" : "border-transparent hover:border-border"
                        }`}
                        aria-label={`Imagen ${i + 1}`}
                      >
                        <Image
                          src={g.url}
                          alt={g.alt ?? ""}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col md:py-8">
          {shopLabel ? (
            <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb">
              <Link
                href={withBasePath(basePath, "/tienda")}
                className="cursor-pointer transition-colors duration-200 hover:text-primary"
              >
                {shopLabel}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-primary">{product.name}</span>
            </nav>
          ) : null}

          {isPdpFieldVisible(presentation, "badges") &&
          product.badges &&
          product.badges.length > 0 ? (
            <p className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-[0.18em] text-secondary">
              {product.badges.map((b) => (
                <span key={b}>{badgeLabel(b, uiBadges)}</span>
              ))}
            </p>
          ) : null}

          <h1 className="font-serif text-4xl tracking-wide md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <p className="font-serif text-2xl">
              {selected?.displayPrice ?? product.variants[0]?.displayPrice}
            </p>
            {selected?.compareAtPrice ? (
              <p className="text-sm text-muted line-through">
                {selected.compareAtPrice}
              </p>
            ) : null}
            {pct != null && pct > 0 ? (
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                −{pct}%
              </span>
            ) : null}
          </div>

          {isPdpFieldVisible(presentation, "shortDescription") &&
          product.shortDescription ? (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-primary md:text-base">
              {product.shortDescription}
            </p>
          ) : null}

          {isPdpFieldVisible(presentation, "description") &&
          product.description ? (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted md:text-base">
              {product.description}
            </p>
          ) : null}

          {isPdpFieldVisible(presentation, "highlights") &&
          product.highlights &&
          product.highlights.length > 0 ? (
            <ul className="mt-6 max-w-md space-y-1 text-sm text-primary">
              {product.highlights.map((h) => (
                <li key={h}>· {h}</li>
              ))}
            </ul>
          ) : null}

          {isPdpFieldVisible(presentation, "bulletPoints") &&
          product.bulletPoints &&
          product.bulletPoints.length > 0 ? (
            <ul className="mt-4 max-w-md list-disc space-y-1 pl-5 text-sm text-muted">
              {product.bulletPoints.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}

          {isPdpFieldVisible(presentation, "highlights") &&
          product.keyFeatures &&
          product.keyFeatures.length > 0 ? (
            <ul className="mt-4 max-w-md space-y-1 text-sm text-muted">
              {product.keyFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : null}

          {showVariants && usePickers ? (
            <div className="mt-8 space-y-6">
              {dimensions.map((dimension, dimensionIndex) => {
                const values = valuesForDimension(pickerVariants, dimension);
                return (
                  <div key={dimension} className="space-y-3">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
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
                            className={`cursor-pointer border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                              soldOutChip ? "line-through opacity-60" : ""
                            } ${
                              active
                                ? "border-primary bg-primary text-background"
                                : "border-border text-primary hover:border-primary"
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
            <div className="mt-8 space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                Variante
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={!v.available}
                    onClick={() => actions.selectVariant(v.id)}
                    className={`cursor-pointer border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      selected?.id === v.id
                        ? "border-primary bg-primary text-background"
                        : "border-border text-primary hover:border-primary"
                    }`}
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
            <p className="mt-6 text-sm text-muted">{stockMessage}</p>
          ) : null}

          {product.madeToOrderClosed ? (
            <p className="mt-6 text-sm text-muted">
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
            <div className="mt-8 flex items-center border border-border w-fit">
              <button
                type="button"
                className="cursor-pointer p-3 transition-colors hover:bg-surface disabled:opacity-40"
                disabled={quantity <= 1 || pending}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
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
                  (quantity >= stockCapQty && !(nextQtyTransition && shouldOpenStockToMtoModal(nextQtyTransition))) || pending
                }
                onClick={onIncrementQuantity}
                aria-label="Más"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          ) : null}

          {!showInlineMto ? (
          <div className="mt-10">
            <button
              type="button"
              disabled={!canBuy || pending}
              onClick={onAdd}
              className="w-full cursor-pointer bg-primary px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-background transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:min-w-[240px]"
            >
              {pending
                ? uiProduct.addingToCart
                : stockLabel === "out_of_stock" || !variantAvailable
                  ? uiProduct.outOfStock
                  : uiProduct.addToCart}
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
          </div>
          ) : null}

          {((isPdpFieldVisible(presentation, "specifications") &&
            product.specifications?.length) ||
            (isPdpFieldVisible(presentation, "categoryLabels") &&
              product.categoryLabels?.length) ||
            (isPdpFieldVisible(presentation, "collectionLabels") &&
              product.collectionLabels?.length) ||
            (isPdpFieldVisible(presentation, "brandLabel") &&
              product.brandLabel)) && (
            <dl className="mt-12 space-y-3 border-t border-border pt-8 text-sm">
              {isPdpFieldVisible(presentation, "brandLabel") &&
              product.brandLabel ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Marca</dt>
                  <dd>{product.brandLabel}</dd>
                </div>
              ) : null}
              {isPdpFieldVisible(presentation, "categoryLabels") &&
                product.categoryLabels?.map((c) => (
                <div key={c} className="flex justify-between gap-4">
                  <dt className="text-muted">Categoría</dt>
                  <dd>{c}</dd>
                </div>
              ))}
              {isPdpFieldVisible(presentation, "collectionLabels") &&
                product.collectionLabels?.map((c) => (
                <div key={`col-${c}`} className="flex justify-between gap-4">
                  <dt className="text-muted">Colección</dt>
                  <dd>{c}</dd>
                </div>
              ))}
              {isPdpFieldVisible(presentation, "specifications") &&
                product.specifications?.map((s) => (
                <div key={s.key} className="flex justify-between gap-4">
                  <dt className="text-muted">{s.key}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {isPdpFieldVisible(presentation, "relatedProducts") &&
      capabilities.relatedProducts !== "unsupported" &&
      product.relatedProducts &&
      product.relatedProducts.length > 0 && (
          <section className="mx-auto mt-24 max-w-7xl px-6 md:px-8">
            <h2 className="mb-10 font-serif text-3xl tracking-wide md:text-4xl">
              {relatedTitle}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
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
