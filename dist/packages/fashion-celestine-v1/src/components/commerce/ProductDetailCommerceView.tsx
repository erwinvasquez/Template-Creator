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
import { SHOP_PATH, withBasePath } from "../../content/resolve";
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
  labels?: Record<string, string | undefined>,
): string {
  const known = labels?.[key];
  if (known) return known;
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function stockCopy(
  label: StockLabel | null | undefined,
  ui: {
    outOfStock?: string;
    contact?: string;
    lowStock?: string;
  },
): string | null {
  if (!label || label === "available") return null;
  if (label === "out_of_stock") return ui.outOfStock ?? "Agotado";
  if (label === "contact") return ui.contact ?? "Consultar disponibilidad";
  return null;
}

function optionDimensions(variants: ProductVariantViewModel[]) {
  const names = new Set<string>();
  for (const v of variants) {
    for (const o of v.options) names.add(o.name);
  }
  return [...names].map((name) => {
    const values = [
      ...new Set(
        variants.flatMap((v) =>
          v.options.filter((o) => o.name === name).map((o) => o.value),
        ),
      ),
    ];
    return { name, values };
  });
}

export function ProductDetailCommerceView({
  product,
  capabilities,
  actions,
  errorMessage,
}: ProductDetailViewProps) {
  const { payload, basePath } = useSiteContent();
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryManual, setGalleryManual] = useState(false);
  const [optionSel, setOptionSel] = useState<Record<string, string>>({});

  const selected =
    product.variants.find((v) => v.id === product.selectedVariantId) ??
    product.variants[0];

  const uiProduct = payload.ui?.product;
  const uiBadges = uiProduct?.badges;
  const relatedTitle =
    uiProduct?.relatedTitle ?? "Otras piezas de esta ocasión";
  const shippingNote = uiProduct?.shippingNote;
  const shopLabel =
    payload.navigation.primary.find(
      (l) =>
        (l.type === "path" && l.href.startsWith(SHOP_PATH)) ||
        l.type === "shopFilter",
    )?.label ?? "Vestidos";

  const dims = useMemo(
    () => optionDimensions(product.variants),
    [product.variants],
  );

  const showVariants =
    capabilities.variantSelector !== "unsupported" &&
    product.variants.length > 1;

  const occasionChips = [
    ...(product.collectionLabels ?? []),
    ...(product.categoryLabels ?? []),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

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
        setLocalError(res.errorMessage ?? "No se pudo reservar la prueba");
        return;
      }
      actions.openCartDrawer();
    } finally {
      setPending(false);
    }
  }

  const stockMessage = stockCopy(stockLabel, {
    outOfStock: uiProduct?.outOfStock,
    contact: uiProduct?.contact,
    lowStock: uiProduct?.lowStock,
  });

  const ctaLabel = pending
    ? "Reservando…"
    : stockLabel === "out_of_stock" || !variantAvailable
      ? (uiProduct?.outOfStock ?? "Agotado")
      : (uiProduct?.addToCart ?? "Reservar prueba");

  const quantityLabel =
    product.madeToOrderClosed || product.categoryLabels?.some((c) =>
      /prueba|reserva/i.test(c),
    )
      ? "Plazas"
      : "Cantidad";

  return (
    <div className="bg-background pb-24 pt-28 md:pb-32 md:pt-36">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <nav className="mb-8 text-xs text-muted" aria-label="Breadcrumb">
          <Link
            href={withBasePath(basePath, SHOP_PATH)}
            className="cursor-pointer transition-colors duration-200 hover:text-cta"
          >
            {shopLabel}
          </Link>
          <span className="mx-2 text-border">/</span>
          <span className="text-primary">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Portrait gallery */}
          <div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface shadow-[0_24px_48px_-28px_rgba(156,79,95,0.22)]">
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
                <p className="absolute left-4 top-4 flex flex-wrap gap-2">
                  {product.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded-full bg-cta px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm"
                    >
                      {badgeLabel(b, uiBadges as Record<string, string | undefined>)}
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
            {product.gallery.length > 1 ? (
              <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
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
                        className={`relative h-20 w-16 cursor-pointer overflow-hidden rounded-2xl border transition-colors duration-200 ${
                          active
                            ? "border-cta ring-1 ring-cta/30"
                            : "border-border hover:border-cta/50"
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

          {/* Purchase column */}
          <div className="celestine-panel rounded-2xl border border-border bg-white p-7 md:p-9">
            {occasionChips.length > 0 ? (
              <div className="mb-5 flex flex-wrap gap-2">
                {occasionChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-border bg-surface/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}

            <h1 className="font-serif text-4xl leading-[1.05] tracking-wide text-primary md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <p className="font-serif text-2xl text-primary">
                {selected?.displayPrice ?? product.variants[0]?.displayPrice}
              </p>
              {selected?.compareAtPrice ? (
                <p className="text-sm text-muted line-through">
                  {selected.compareAtPrice}
                </p>
              ) : null}
              {pct != null && pct > 0 ? (
                <span className="rounded-full bg-cta/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cta">
                  −{pct}%
                </span>
              ) : null}
            </div>

            {product.shortDescription ? (
              <p className="mt-5 text-sm leading-relaxed text-primary md:text-base">
                {product.shortDescription}
              </p>
            ) : null}

            {product.description ? (
              <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                {product.description}
              </p>
            ) : null}

            {product.highlights && product.highlights.length > 0 ? (
              <ul className="mt-6 space-y-2 border-t border-border pt-6 text-sm text-primary">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cta" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {product.bulletPoints && product.bulletPoints.length > 0 ? (
              <ul className="mt-4 space-y-1.5 text-sm text-muted">
                {product.bulletPoints.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cta/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {showVariants
              ? dims.map((dim) => (
                  <div key={dim.name} className="mt-7 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
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
                            className={`cursor-pointer rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                              active
                                ? "border-cta bg-cta text-white"
                                : "border-border bg-background text-primary hover:border-cta/60 hover:text-cta"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              : null}

            {capabilities.stockIndicator !== "unsupported" && stockMessage ? (
              <p className="mt-6 text-sm text-muted">{stockMessage}</p>
            ) : null}

            {product.preparationPromiseLabel ? (
              <p className="mt-6 text-sm text-muted">
                {payload.ui?.salesMode?.madeToOrder?.preparationLabel ?? "Preparación"}
                : {product.preparationPromiseLabel}
              </p>
            ) : null}

            {product.madeToOrderClosed ? (
              <p className="mt-6 rounded-2xl border border-border bg-surface/60 px-4 py-3 text-sm text-muted">
                {uiProduct?.madeToOrderClosed ??
                  payload.ui?.salesMode?.madeToOrder?.closedMessage ??
                  "Reservas cerradas temporalmente"}
                {product.madeToOrderReopensAtLabel
                  ? ` ${
                      payload.ui?.salesMode?.madeToOrder?.reopensPrefix
                        ? `${payload.ui.salesMode.madeToOrder.reopensPrefix} `
                        : ""
                    }${product.madeToOrderReopensAtLabel}`
                  : ""}
              </p>
            ) : null}

            {canBuy ? (
              <div className="mt-8 flex items-center justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
                  {quantityLabel}
                </p>
                <div className="flex items-center overflow-hidden rounded-full border border-border bg-background">
                  <button
                    type="button"
                    className="cursor-pointer p-3 transition-colors hover:bg-surface disabled:opacity-40"
                    disabled={quantity <= 1 || pending}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Menos"
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                  <span className="w-10 text-center text-sm tabular-nums text-primary">
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
              </div>
            ) : null}

            <button
              type="button"
              disabled={!canBuy || pending}
              onClick={onAdd}
              className="mt-6 w-full cursor-pointer rounded-full bg-cta px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-cta-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ctaLabel}
            </button>
            {(errorMessage || localError) && (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {localError ?? errorMessage}
              </p>
            )}

            {shippingNote ? (
              <p className="mt-6 rounded-2xl border border-border/80 bg-surface/50 px-4 py-3.5 text-sm leading-relaxed text-muted">
                {shippingNote}
              </p>
            ) : null}

            {(product.specifications?.length || product.brandLabel) && (
              <dl className="mt-8 space-y-3 border-t border-border pt-7 text-sm">
                {product.brandLabel ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Casa</dt>
                    <dd className="text-right font-medium text-primary">
                      {product.brandLabel}
                    </dd>
                  </div>
                ) : null}
                {product.specifications?.map((s) => (
                  <div key={s.key} className="flex justify-between gap-4">
                    <dt className="text-muted">{s.key}</dt>
                    <dd className="text-right text-primary">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>

      {capabilities.relatedProducts !== "unsupported" &&
        product.relatedProducts &&
        product.relatedProducts.length > 0 && (
          <section className="mx-auto mt-24 max-w-7xl px-6 md:px-10">
            <p className="celestine-eyebrow">Para completar el look</p>
            <h2 className="mt-2 font-serif text-3xl tracking-wide text-primary md:text-4xl">
              {relatedTitle}
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {product.relatedProducts.map((p) => (
                <CommerceProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
    </div>
  );
}
