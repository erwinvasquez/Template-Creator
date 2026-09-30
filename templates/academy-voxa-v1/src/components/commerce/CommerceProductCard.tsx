"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductCardViewModel } from "@shopenlinea/commerce-runtime-contract";
import {
  catalogCardHref,
  resolveCatalogAvailabilityPresentation,
} from "@shopenlinea/commerce-runtime-contract";
import { useSiteContent } from "../../lib/site-content";
import { requireUi } from "../../lib/ui";
import { withBasePath } from "../../content/resolve";

export function CommerceProductCard({
  product,
  priority = false,
}: {
  product: ProductCardViewModel;
  priority?: boolean;
}) {
  const { payload, basePath } = useSiteContent();
  const productUi = requireUi(payload).product;
  const badges = productUi.badges;

  const isNew = product.badges?.includes("new");
  const isFeatured = product.badges?.includes("featured");
  const isSale = product.badges?.includes("sale");
  const isBestseller = product.badges?.includes("bestseller");
  const isLimited =
    product.badges?.includes("limitedEdition") ||
    product.badges?.includes("limited");
  const presentation = resolveCatalogAvailabilityPresentation(product);
  const soldOut = presentation === "sold_out";
  const mtoAvailable = presentation === "made_to_order_available";
  const href = withBasePath(basePath, catalogCardHref(product));

  const primaryBadge = isNew
    ? badges.new
    : isLimited
      ? badges.limitedEdition
      : isFeatured
        ? badges.featured
        : isSale
          ? badges.sale
          : isBestseller
            ? badges.bestseller
            : null;

  const meta = product.categoryLabels?.[0] ?? null;

  return (
    <Link
      href={href}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-white transition-colors duration-200 hover:border-cta"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority={priority}
              className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
                soldOut ? "opacity-60" : ""
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          {primaryBadge ? (
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-background">
              {primaryBadge}
            </span>
          ) : null}
          {product.discountPercent != null && product.discountPercent > 0 ? (
            <span className="absolute right-4 top-4 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              −{product.discountPercent}%
            </span>
          ) : null}
          {mtoAvailable ? (
            <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-2 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-white">
              {productUi.buyMadeToOrderCta}
            </span>
          ) : soldOut ? (
            <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-2 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-white">
              {productUi.outOfStock}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-5 md:p-6">
          {meta ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
              {meta}
            </p>
          ) : null}
          <h3 className="mt-2 font-serif text-xl leading-tight text-primary transition-colors duration-200 group-hover:text-primary md:text-2xl">
            {product.name}
          </h3>
          <p className="mt-auto flex items-baseline gap-2 border-t border-border pt-5 text-sm text-muted">
            <span className="font-serif text-xl text-primary">
              {product.displayPrice}
            </span>
            {product.compareAtPrice ? (
              <span className="line-through opacity-60">
                {product.compareAtPrice}
              </span>
            ) : null}
          </p>
        </div>
      </article>
    </Link>
  );
}
