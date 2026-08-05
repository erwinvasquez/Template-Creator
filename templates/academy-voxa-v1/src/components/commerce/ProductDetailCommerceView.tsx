"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
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

function optionDimensions(variants: ProductVariantViewModel[]) {
  const names = new Set<string>();
  for (const v of variants) {
    for (const o of v.options) names.add(o.name);
  }
  // En academia solo se elige modalidad; duración/nivel son informativos.
  const pickable = [...names].filter((n) => n === "Modalidad");
  const dims = (pickable.length ? pickable : [...names].slice(0, 1)).map(
    (name) => {
      const values = [
        ...new Set(
          variants.flatMap((v) =>
            v.options.filter((o) => o.name === name).map((o) => o.value),
          ),
        ),
      ];
      return { name, values };
    },
  );
  return dims.filter((d) => d.values.length > 1);
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
  const uiBadges = {
    ...uiProduct.badges,
    limitedEdition: uiProduct.badges.limitedEdition,
  };
  const relatedTitle = uiProduct.relatedTitle;
  const shippingNote = uiProduct.shippingNote;
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const selected =
    product.variants.find((v) => v.id === product.selectedVariantId) ??
    product.variants[0];

  const shopLabel =
    payload.navigation.primary.find(
      (l) =>
        (l.type === "path" && l.href.startsWith("/catalogo")) ||
        l.type === "shopFilter",
    )?.label ?? "Programas";

  const modalityDims = useMemo(
    () => optionDimensions(product.variants),
    [product.variants],
  );

  const showModalities =
    capabilities.variantSelector !== "unsupported" &&
    modalityDims.length > 0;

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

  const isBook = product.categoryLabels?.some((c) =>
    /libro/i.test(c),
  );

  const modality = optionValue(selected, "Modalidad");
  const duration = optionValue(selected, "Duración");
  const level = optionValue(selected, "Nivel");

  const metaChips = [
    ...(product.categoryLabels ?? []),
    ...(modality ? [modality] : []),
    ...(duration ? [duration] : []),
    ...(level ? [level] : []),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const mainImage =
    product.gallery[galleryIndex] ?? product.gallery[0] ?? null;

  useEffect(() => {
    setQuantity(1);
    setLocalError(null);
    setGalleryIndex(0);
  }, [product.id, selected?.id]);

  function pickModality(value: string) {
    const match = product.variants.find((v) =>
      v.options.some((o) => o.name === "Modalidad" && o.value === value),
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

          <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7 animate-fade-up">
              {product.badges && product.badges.length > 0 ? (
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

              <p className="voxa-rule text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
                {product.collectionLabels?.[0] ??
                  product.categoryLabels?.[0] ??
                  "Programa Voxa"}
              </p>

              <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.1] text-balance text-white md:text-6xl">
                {product.name}
              </h1>

              {product.shortDescription ? (
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
            <aside className="lg:col-span-5 animate-fade-up [animation-delay:120ms]">
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
                  ? modalityDims.map((dim) => (
                      <div key={dim.name} className="mt-6 space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
                          {dim.name}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dim.values.map((val) => {
                            const active =
                              optionValue(selected, dim.name) === val;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => pickModality(val)}
                                className={`cursor-pointer rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200 ${
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
                    ))
                  : null}

                {capabilities.stockIndicator !== "unsupported" &&
                stockMessage ? (
                  <p className="mt-5 text-sm text-muted">{stockMessage}</p>
                ) : null}

                {product.preparationPromiseLabel ? (
                  <p className="mt-5 text-sm text-muted">
                    {madeToOrderUi.preparationLabel}:{" "}
                    {product.preparationPromiseLabel}
                  </p>
                ) : null}

                {product.madeToOrderClosed ? (
                  <p className="mt-5 text-sm text-muted">
                    {uiProduct.madeToOrderClosed}
                    {product.madeToOrderReopensAtLabel
                      ? ` ${madeToOrderUi.reopensPrefix} ${product.madeToOrderReopensAtLabel}`
                      : ""}
                  </p>
                ) : null}

                {canBuy ? (
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
                        disabled={quantity >= maxQty || pending}
                        onClick={() =>
                          setQuantity((q) => Math.min(maxQty, q + 1))
                        }
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

                {shippingNote ? (
                  <p className="mt-5 border-t border-border pt-5 text-sm leading-relaxed text-muted">
                    {shippingNote}
                  </p>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Galería secundaria (sesión / entorno) */}
      {product.gallery.length > 1 ? (
        <div className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-6 py-5 md:px-10">
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
      ) : null}

      {/* Contenido del programa */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7 animate-fade-up">
            <p className="voxa-rule text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary">
              {isBook ? "Sobre el libro" : "Sobre el programa"}
            </p>
            {product.description ? (
              <p className="mt-4 text-base leading-relaxed text-primary md:text-lg">
                {product.description}
              </p>
            ) : null}

            {product.bulletPoints && product.bulletPoints.length > 0 ? (
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
            {product.highlights && product.highlights.length > 0 ? (
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

            {(product.specifications?.length ||
              product.brandLabel ||
              product.categoryLabels?.length ||
              product.collectionLabels?.length) && (
              <dl className="mt-6 space-y-3 rounded-xl border border-border bg-white px-6 py-5 text-sm">
                {product.brandLabel ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Academia</dt>
                    <dd className="text-right text-primary">
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
      </section>

      {capabilities.relatedProducts !== "unsupported" &&
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
    </div>
  );
}
