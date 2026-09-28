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
  const limitedLabel = badges.limitedEdition;

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
      ? limitedLabel
      : isFeatured
        ? badges.featured
        : isSale
          ? badges.sale
          : isBestseller
            ? badges.bestseller
            : null;

  return (
    <Link href={href} className="group cursor-pointer block">
      <article>
        <div className="relative aspect-square overflow-hidden bg-surface">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority={priority}
              className={`object-cover transition-opacity duration-500 group-hover:opacity-0 ${
                soldOut ? "opacity-60" : ""
              }`}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          )}
          {product.galleryPreview && (
            <Image
              src={product.galleryPreview}
              alt=""
              fill
              aria-hidden
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          )}
          {primaryBadge ? (
            <span className="absolute left-3 top-3 bg-ink/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white">
              {primaryBadge}
            </span>
          ) : null}
          {product.discountPercent != null && product.discountPercent > 0 ? (
            <span className="absolute right-3 top-3 bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-background">
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
        <div className="mt-4 space-y-1">
          <h3 className="font-serif text-xl leading-tight tracking-wide transition-colors duration-200 group-hover:text-primary">
            {product.name}
          </h3>
          <p className="text-sm text-muted">
            {product.displayPrice}
            {product.compareAtPrice ? (
              <span className="ml-2 line-through opacity-60">
                {product.compareAtPrice}
              </span>
            ) : null}
          </p>
        </div>
      </article>
    </Link>
  );
}
