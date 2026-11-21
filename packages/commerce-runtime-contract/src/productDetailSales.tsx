"use client";

/**
 * Bloques de venta de la ficha y de las tarjetas (Sprint 119), comunes a todos los templates.
 *
 * Definen contenido y comportamiento, no la estética: cada template los ubica en su diseño y los viste con sus
 * clases (`className`, `*ClassName`) o con variables CSS (todas opcionales):
 *   --pdp-star-color (estrellas llenas), --pdp-muted-opacity (estrellas vacías, barras), --pdp-accent (barras).
 * Los textos llegan traducidos desde el host (`product.salesCopy`).
 *
 * Regla de venta: sin reseñas no se muestra nada (un "0 opiniones" junto al título resta, no suma).
 */

import { useEffect, useState, type ReactNode, type RefObject } from "react";

import type { CommerceRuntimeActions } from "./actions";
import type { ProductDetailViewModel, ProductVariantViewModel } from "./product";
import type {
  ProductCardRatingViewModel,
  ProductDetailSalesCopy,
  ProductReviewItemViewModel,
} from "./reviews";

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

function fill(template: string, key: string, value: string | number): string {
  return template.replace(`{${key}}`, String(value));
}

// ─── Estrellas ─────────────────────────────────────────────────────────────────────────────────────────────────

export type RatingStarsProps = Readonly<{
  /** 0–5, admite decimales (4.6). */
  value: number;
  ariaLabel?: string;
  className?: string;
}>;

/** Cinco estrellas con relleno parcial. Toma el tamaño del texto (`font-size`) del contenedor. */
export function RatingStars({ value, ariaLabel, className }: RatingStarsProps) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cx("relative inline-block whitespace-nowrap leading-none tracking-[0.08em]", className)}
    >
      <span style={{ opacity: "var(--pdp-muted-opacity, 0.25)" }}>★★★★★</span>
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${pct}%`, color: "var(--pdp-star-color, currentColor)" }}
      >
        ★★★★★
      </span>
    </span>
  );
}

// ─── Resumen junto al título ───────────────────────────────────────────────────────────────────────────────────

export type ProductDetailRatingSummaryProps = Readonly<{
  product: ProductDetailViewModel;
  /** Ancla de la sección de opiniones. */
  href?: string;
  className?: string;
  starsClassName?: string;
  labelClassName?: string;
}>;

export function ProductDetailRatingSummary({
  product,
  href = "#opiniones",
  className,
  starsClassName,
  labelClassName,
}: ProductDetailRatingSummaryProps) {
  const reviews = product.reviews;
  const copy = product.salesCopy;
  if (!reviews || reviews.count <= 0 || !copy) return null;
  return (
    <a href={href} className={cx("inline-flex items-center gap-2 no-underline", className)}>
      <RatingStars value={reviews.average} ariaLabel={copy.averageLabel} className={starsClassName} />
      <span className={labelClassName}>
        {copy.averageLabel} · {copy.reviewsCountLabel}
      </span>
    </a>
  );
}

// ─── Señales de precio: ahorro y stock bajo ────────────────────────────────────────────────────────────────────

export type ProductDetailPriceSignalsProps = Readonly<{
  variant: ProductVariantViewModel | null | undefined;
  copy: ProductDetailSalesCopy | null | undefined;
  className?: string;
  savingsClassName?: string;
  lowStockClassName?: string;
}>;

export function ProductDetailPriceSignals({
  variant,
  copy,
  className,
  savingsClassName,
  lowStockClassName,
}: ProductDetailPriceSignalsProps) {
  const savings = variant?.savingsLabel;
  const low = variant?.lowStockQuantity;
  if (!savings && !(copy && low && low > 0)) return null;
  return (
    <div className={cx("flex flex-wrap items-center gap-x-3 gap-y-1", className)}>
      {savings ? <span className={savingsClassName}>{savings}</span> : null}
      {copy && low && low > 0 ? (
        <span className={lowStockClassName} role="status">
          {fill(copy.lowStockTemplate, "count", low)}
        </span>
      ) : null}
    </div>
  );
}

// ─── Guía de tallas ────────────────────────────────────────────────────────────────────────────────────────────

export function ProductDetailSizeGuideLink({
  product,
  className,
}: Readonly<{ product: ProductDetailViewModel; className?: string }>) {
  if (!product.sizeGuideHref || !product.salesCopy) return null;
  return (
    <a href={product.sizeGuideHref} target="_blank" rel="noopener noreferrer" className={cx("underline underline-offset-4", className)}>
      {product.salesCopy.sizeGuide}
    </a>
  );
}

// ─── Debajo del botón: comprar ahora, confianza, consulta ──────────────────────────────────────────────────────

function TrustIcon({ kind }: { kind: "shipping" | "returns" | "secure" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (kind === "shipping") {
    return (
      <svg {...common}>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
        <circle cx="7" cy="17.5" r="1.5" />
        <circle cx="17.5" cy="17.5" r="1.5" />
      </svg>
    );
  }
  if (kind === "returns") {
    return (
      <svg {...common}>
        <path d="M4 9h11a5 5 0 0 1 0 10H8" />
        <path d="M8 5 4 9l4 4" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export type ProductDetailPurchaseExtrasProps = Readonly<{
  product: ProductDetailViewModel;
  /** "Comprar ahora": el template agrega al carrito y llama `actions.navigateToCheckout()`. */
  onBuyNow?: () => void;
  buyNowDisabled?: boolean;
  className?: string;
  buyNowClassName?: string;
  trustClassName?: string;
  trustItemClassName?: string;
  consultClassName?: string;
}>;

export function ProductDetailPurchaseExtras({
  product,
  onBuyNow,
  buyNowDisabled,
  className,
  buyNowClassName,
  trustClassName,
  trustItemClassName,
  consultClassName,
}: ProductDetailPurchaseExtrasProps) {
  const copy = product.salesCopy;
  if (!copy) return null;
  const trust = product.trust;
  const items: Array<{ kind: "shipping" | "returns" | "secure"; text: ReactNode }> = [];
  if (trust?.shippingNote) items.push({ kind: "shipping", text: trust.shippingNote });
  if (trust?.returnsNote) items.push({ kind: "returns", text: trust.returnsNote });
  if (trust?.paymentMethodLabels?.length) {
    items.push({ kind: "secure", text: `${copy.securePayment} · ${trust.paymentMethodLabels.join(", ")}` });
  }
  const showBuyNow = product.buyNowEnabled === true && Boolean(onBuyNow);
  if (!showBuyNow && items.length === 0 && !product.whatsAppConsultHref) return null;

  return (
    <div className={cx("space-y-3", className)}>
      {showBuyNow ? (
        <button type="button" onClick={onBuyNow} disabled={buyNowDisabled} className={buyNowClassName}>
          {copy.buyNow}
        </button>
      ) : null}
      {items.length > 0 ? (
        <ul className={cx("list-none space-y-2 pl-0", trustClassName)}>
          {items.map((item) => (
            <li key={item.kind} className={cx("flex items-start gap-2", trustItemClassName)}>
              <span className="mt-[1px] shrink-0">
                <TrustIcon kind={item.kind} />
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {product.whatsAppConsultHref ? (
        <a
          href={product.whatsAppConsultHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cx("inline-flex items-center gap-2 underline underline-offset-4", consultClassName)}
        >
          {copy.whatsAppConsult}
        </a>
      ) : null}
    </div>
  );
}

// ─── Sección de opiniones ──────────────────────────────────────────────────────────────────────────────────────

export type ProductDetailReviewsSectionProps = Readonly<{
  product: ProductDetailViewModel;
  actions?: Pick<CommerceRuntimeActions, "loadMoreProductReviews"> | null;
  /** Id del ancla (el resumen junto al título enlaza aquí). */
  id?: string;
  className?: string;
  headingClassName?: string;
  summaryClassName?: string;
  averageClassName?: string;
  barTrackClassName?: string;
  listClassName?: string;
  itemClassName?: string;
  metaClassName?: string;
  verifiedClassName?: string;
  replyClassName?: string;
  loadMoreClassName?: string;
}>;

export function ProductDetailReviewsSection({
  product,
  actions,
  id = "opiniones",
  className,
  headingClassName,
  summaryClassName,
  averageClassName,
  barTrackClassName,
  listClassName,
  itemClassName,
  metaClassName,
  verifiedClassName,
  replyClassName,
  loadMoreClassName,
}: ProductDetailReviewsSectionProps) {
  const reviews = product.reviews;
  const copy = product.salesCopy;
  const [items, setItems] = useState<readonly ProductReviewItemViewModel[]>(reviews?.items ?? []);
  const [cursor, setCursor] = useState<string | null>(reviews?.nextCursor ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(reviews?.items ?? []);
    setCursor(reviews?.nextCursor ?? null);
  }, [product.id, reviews]);

  if (!reviews || reviews.count <= 0 || !copy) return null;

  const loadMore = async () => {
    if (!cursor || !actions?.loadMoreProductReviews) return;
    setLoading(true);
    try {
      const page = await actions.loadMoreProductReviews(product.id, cursor);
      if (page) {
        setItems((prev) => [...prev, ...page.items.filter((it) => !prev.some((p) => p.id === it.id))]);
        setCursor(page.nextCursor);
      }
    } finally {
      setLoading(false);
    }
  };

  const max = Math.max(1, ...reviews.distribution.map((d) => d.count));

  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cx("scroll-mt-24", className)}>
      <h2 id={`${id}-title`} className={headingClassName}>
        {copy.reviewsTitle}
      </h2>
      <div className={cx("mt-4 grid gap-6 md:grid-cols-[minmax(0,240px)_1fr]", summaryClassName)}>
        <div className="space-y-2">
          <p className={averageClassName}>{copy.averageLabel}</p>
          <RatingStars value={reviews.average} ariaLabel={copy.averageLabel} className="text-xl" />
          <p className={metaClassName}>{copy.reviewsCountLabel}</p>
          <ul className="list-none space-y-1 pl-0 pt-2">
            {reviews.distribution.map((d) => (
              <li key={d.stars} className={cx("flex items-center gap-2 text-sm", metaClassName)}>
                <span className="w-4 tabular-nums">{d.stars}</span>
                <span aria-hidden="true">★</span>
                <span className={cx("relative h-1.5 flex-1 overflow-hidden rounded-full", barTrackClassName)}>
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{ background: "currentColor", opacity: "var(--pdp-muted-opacity, 0.2)" }}
                  />
                  <span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${(d.count / max) * 100}%`, background: "var(--pdp-accent, currentColor)" }}
                  />
                </span>
                <span className="w-8 text-right tabular-nums">{d.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <ul className={cx("list-none space-y-6 pl-0", listClassName)}>
          {items.map((review) => (
            <li key={review.id} className={cx("space-y-2", itemClassName)}>
              <RatingStars value={review.rating} ariaLabel={fill(copy.starsAriaTemplate, "stars", review.rating)} />
              {review.title ? <p className="font-medium">{review.title}</p> : null}
              <p className="whitespace-pre-line">{review.body}</p>
              <p className={cx("flex flex-wrap items-center gap-x-2 gap-y-1 text-sm", metaClassName)}>
                <span>{review.authorName}</span>
                <span aria-hidden="true">·</span>
                <span>{review.dateLabel}</span>
                {review.verifiedPurchase ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className={verifiedClassName}>✓ {copy.verifiedPurchase}</span>
                  </>
                ) : null}
                {review.variantLabel ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{review.variantLabel}</span>
                  </>
                ) : null}
              </p>
              {review.merchantReply ? (
                <div className={cx("ml-4 border-l-2 pl-3", replyClassName)} style={{ borderColor: "currentColor" }}>
                  <p className="text-sm font-medium">{copy.merchantReplyTitle}</p>
                  <p className="text-sm whitespace-pre-line">{review.merchantReply.body}</p>
                  <p className={cx("text-xs", metaClassName)}>{review.merchantReply.dateLabel}</p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      {cursor && actions?.loadMoreProductReviews ? (
        <div className="mt-6">
          <button type="button" onClick={() => void loadMore()} disabled={loading} className={loadMoreClassName}>
            {copy.loadMoreReviews}
          </button>
        </div>
      ) : null}
    </section>
  );
}

// ─── Barra fija de compra en celular ───────────────────────────────────────────────────────────────────────────

export type ProductDetailStickyPurchaseBarProps = Readonly<{
  /** El botón principal "Añadir al carrito": la barra aparece cuando sale de la pantalla. */
  anchorRef: RefObject<HTMLElement | null>;
  title: string;
  priceLabel: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
}>;

/** Solo en pantallas chicas (`md:hidden`). Respeta el área segura inferior del teléfono. */
export function ProductDetailStickyPurchaseBar({
  anchorRef,
  title,
  priceLabel,
  actionLabel,
  onAction,
  disabled,
  className,
  buttonClassName,
}: ProductDetailStickyPurchaseBarProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = anchorRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry && !entry.isIntersecting && entry.boundingClientRect.top < 0)),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [anchorRef]);

  return (
    <div
      aria-hidden={!visible}
      className={cx(
        "fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 px-4 pt-3 transition-transform duration-200 md:hidden",
        visible ? "translate-y-0" : "pointer-events-none translate-y-full",
        className,
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{title}</p>
        <p className="text-sm font-medium">{priceLabel}</p>
      </div>
      <button type="button" onClick={onAction} disabled={disabled} tabIndex={visible ? 0 : -1} className={buttonClassName}>
        {actionLabel}
      </button>
    </div>
  );
}

// ─── Estrellas en tarjetas ─────────────────────────────────────────────────────────────────────────────────────

export function ProductCardRating({
  rating,
  className,
}: Readonly<{ rating: ProductCardRatingViewModel | null | undefined; className?: string }>) {
  if (!rating || rating.count <= 0) return null;
  return (
    <span className={cx("inline-flex items-center gap-1 text-xs", className)}>
      <RatingStars value={rating.average} ariaLabel={`${rating.averageLabel} / 5`} />
      <span className="tabular-nums">
        {rating.averageLabel} ({rating.count})
      </span>
    </span>
  );
}
