"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import type {
  ProductDetailViewProps,
  ProductVariantViewModel,
  StockLabel,
} from "@shopenlinea/commerce-runtime-contract";
import { useSiteContent } from "../../lib/site-content";
import { requireUi } from "../../lib/ui";
import { withBasePath } from "../../content/resolve";
import { CommerceProductCard } from "./CommerceProductCard";

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

function optionDimensions(variants: ProductVariantViewModel[]) {
  const names = new Set<string>();
  for (const v of variants) {
    for (const o of v.options) names.add(o.name);
  }
  const dims = [...names].map((name) => {
    const values = [
      ...new Set(
        variants.flatMap((v) =>
          v.options.filter((o) => o.name === name).map((o) => o.value),
        ),
      ),
    ];
    return { name, values };
  });
  const multi =
    dims.length >= 2 && dims.every((d) => d.values.length >= 2);
  return { dims, usePickers: multi };
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
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryManual, setGalleryManual] = useState(false);
  const [optionSel, setOptionSel] = useState<Record<string, string>>({});

  const selected =
    product.variants.find((v) => v.id === product.selectedVariantId) ??
    product.variants[0];

  const relatedTitle = uiProduct.relatedTitle;
  const shopLabel = payload.navigation.primary.find(
    (l) =>
      (l.type === "path" && l.href.startsWith("/tienda")) ||
      l.type === "shopFilter",
  )?.label;

  const metaChips = useMemo(
    () => [
      ...(product.categoryLabels ?? []),
      ...(product.collectionLabels ?? []),
    ],
    [product.categoryLabels, product.collectionLabels],
  );

  const specItems = useMemo(
    () => [
      ...(product.highlights ?? []),
      ...(product.keyFeatures ?? []),
    ],
    [product.highlights, product.keyFeatures],
  );

  const { dims, usePickers } = useMemo(
    () => optionDimensions(product.variants),
    [product.variants],
  );

  const showVariants =
    capabilities.variantSelector !== "unsupported" &&
    product.variants.length > 1;

  const maxQty = Math.max(
    0,
    selected?.maxQuantity ?? product.maxQuantity ?? 99,
  );
  const stockLabel = selected?.stockLabel ?? product.stockLabel ?? null;
  const variantAvailable = selected?.available !== false;
  const canBuy =
    Boolean(selected) &&
    product.canAddToCart &&
    variantAvailable &&
    !product.madeToOrderClosed &&
    stockLabel !== "out_of_stock" &&
    maxQty > 0;

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
      const next: Record<string, string> = {};
      for (const o of selected.options) next[o.name] = o.value;
      setOptionSel(next);
      if (selected.imageUrl) {
        const idx = product.gallery.findIndex((g) => g.url === selected.imageUrl);
        if (idx >= 0) setGalleryIndex(idx);
      } else {
        setGalleryIndex(0);
      }
    }
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function pickOption(name: string, value: string) {
    const next = { ...optionSel, [name]: value };
    setOptionSel(next);
    const match = product.variants.find((v) =>
      Object.entries(next).every(([n, val]) =>
        v.options.some((o) => o.name === n && o.value === val),
      ),
    );
    if (match) actions.selectVariant(match.id);
  }

  async function onAdd() {
    if (!selected || !canBuy) return;
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
    <div className="pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
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

        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:items-start">
          {/* Gallery — gear showcase */}
          <div className="lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden border-2 border-primary bg-surface">
              {mainImage?.url && (
                <Image
                  src={mainImage.url}
                  alt={mainImage.alt ?? product.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
              )}
              {product.badges && product.badges.length > 0 ? (
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
              <ul className="category-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
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
            ) : null}
          </div>

          {/* Purchase column — performance panel */}
          <div className="border-2 border-primary bg-background">
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

              {product.shortDescription ? (
                <p className="mt-5 text-sm font-medium leading-relaxed text-primary md:text-base">
                  {product.shortDescription}
                </p>
              ) : null}

              {product.description ? (
                <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                  {product.description}
                </p>
              ) : null}

              {specItems.length > 0 ? (
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

              {product.bulletPoints && product.bulletPoints.length > 0 ? (
                <ul className="mt-4 space-y-1.5 border-l-2 border-cta pl-4 text-sm text-muted">
                  {product.bulletPoints.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}

              {showVariants && usePickers ? (
                <div className="mt-8 space-y-5 border-t border-border pt-6">
                  {dims.map((dim) => (
                    <div key={dim.name} className="space-y-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                        {dim.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dim.values.map((val) => {
                          const active = optionSel[dim.name] === val;
                          const possible = product.variants.some((v) => {
                            const next = { ...optionSel, [dim.name]: val };
                            return Object.entries(next).every(([n, vv]) =>
                              v.options.some(
                                (o) => o.name === n && o.value === vv,
                              ),
                            );
                          });
                          return (
                            <button
                              key={val}
                              type="button"
                              disabled={!possible}
                              onClick={() => pickOption(dim.name, val)}
                              className={variantChipClass(active)}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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

              {capabilities.stockIndicator !== "unsupported" && stockMessage ? (
                <p className="mt-5 text-sm font-medium text-secondary">{stockMessage}</p>
              ) : null}

              {product.preparationPromiseLabel ? (
                <p className="mt-4 text-sm text-muted">
                  {madeToOrderUi.preparationLabel}:{" "}
                  {product.preparationPromiseLabel}
                </p>
              ) : null}

              {product.madeToOrderClosed ? (
                <p className="mt-4 text-sm text-muted">
                  {uiProduct.madeToOrderClosed}
                  {product.madeToOrderReopensAtLabel
                    ? ` ${madeToOrderUi.reopensPrefix} ${product.madeToOrderReopensAtLabel}`
                    : ""}
                </p>
              ) : null}

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
                      disabled={quantity >= maxQty || pending}
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
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

              {(errorMessage || localError) && (
                <p className="mt-3 text-sm text-red-700" role="alert">
                  {localError ?? errorMessage}
                </p>
              )}

              {canBuy && uiProduct.shippingNote ? (
                <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  {uiProduct.shippingNote}
                </p>
              ) : null}

              {(product.specifications?.length || product.brandLabel) && (
                <dl className="mt-8 space-y-0 border-t-2 border-primary pt-6 text-sm">
                  {product.brandLabel ? (
                    <div className="flex justify-between gap-4 border-b border-border py-3">
                      <dt className="font-bold uppercase tracking-[0.12em] text-muted">
                        Marca
                      </dt>
                      <dd className="font-medium text-primary">
                        {product.brandLabel}
                      </dd>
                    </div>
                  ) : null}
                  {product.specifications?.map((s) => (
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
              )}
            </div>
          </div>
        </div>
      </div>

      {capabilities.relatedProducts !== "unsupported" &&
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
    </div>
  );
}
