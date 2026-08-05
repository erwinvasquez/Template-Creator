"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
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

  return (
    <div className="pb-24 pt-28 md:pt-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2 md:gap-16 md:px-8">
        <div>
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
            <ul className="mt-3 flex gap-2 overflow-x-auto">
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
          ) : null}
        </div>

        <div className="flex flex-col md:py-8">
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

          {product.badges && product.badges.length > 0 ? (
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

          {product.shortDescription ? (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-primary md:text-base">
              {product.shortDescription}
            </p>
          ) : null}

          {product.description ? (
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted md:text-base">
              {product.description}
            </p>
          ) : null}

          {product.highlights && product.highlights.length > 0 ? (
            <ul className="mt-6 max-w-md space-y-1 text-sm text-primary">
              {product.highlights.map((h) => (
                <li key={h}>· {h}</li>
              ))}
            </ul>
          ) : null}

          {product.bulletPoints && product.bulletPoints.length > 0 ? (
            <ul className="mt-4 max-w-md list-disc space-y-1 pl-5 text-sm text-muted">
              {product.bulletPoints.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}

          {product.keyFeatures && product.keyFeatures.length > 0 ? (
            <ul className="mt-4 max-w-md space-y-1 text-sm text-muted">
              {product.keyFeatures.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          ) : null}

          {showVariants && usePickers ? (
            <div className="mt-8 space-y-6">
              {dims.map((dim) => (
                <div key={dim.name} className="space-y-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                    {dim.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dim.values.map((val) => {
                      const active = optionSel[dim.name] === val;
                      const possible = product.variants.some((v) => {
                        const next = { ...optionSel, [dim.name]: val };
                        return Object.entries(next).every(([n, vv]) =>
                          v.options.some((o) => o.name === n && o.value === vv),
                        );
                      });
                      return (
                        <button
                          key={val}
                          type="button"
                          disabled={!possible}
                          onClick={() => pickOption(dim.name, val)}
                          className={`cursor-pointer border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
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
              ))}
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

          {capabilities.stockIndicator !== "unsupported" && stockMessage ? (
            <p className="mt-6 text-sm text-muted">{stockMessage}</p>
          ) : null}

          {product.preparationPromiseLabel ? (
            <p className="mt-6 text-sm text-muted">
              {madeToOrderUi.preparationLabel}: {product.preparationPromiseLabel}
            </p>
          ) : null}

          {product.madeToOrderClosed ? (
            <p className="mt-6 text-sm text-muted">
              {uiProduct.madeToOrderClosed}
              {product.madeToOrderReopensAtLabel
                ? ` ${madeToOrderUi.reopensPrefix} ${product.madeToOrderReopensAtLabel}`
                : ""}
            </p>
          ) : null}

          {canBuy ? (
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
                disabled={quantity >= maxQty || pending}
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                aria-label="Más"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          ) : null}

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
          </div>

          {(product.specifications?.length ||
            product.categoryLabels?.length ||
            product.collectionLabels?.length ||
            product.brandLabel) && (
            <dl className="mt-12 space-y-3 border-t border-border pt-8 text-sm">
              {product.brandLabel ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Marca</dt>
                  <dd>{product.brandLabel}</dd>
                </div>
              ) : null}
              {product.categoryLabels?.map((c) => (
                <div key={c} className="flex justify-between gap-4">
                  <dt className="text-muted">Categoría</dt>
                  <dd>{c}</dd>
                </div>
              ))}
              {product.collectionLabels?.map((c) => (
                <div key={`col-${c}`} className="flex justify-between gap-4">
                  <dt className="text-muted">Colección</dt>
                  <dd>{c}</dd>
                </div>
              ))}
              {product.specifications?.map((s) => (
                <div key={s.key} className="flex justify-between gap-4">
                  <dt className="text-muted">{s.key}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {capabilities.relatedProducts !== "unsupported" &&
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
    </div>
  );
}
