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
  const isLimited = product.badges?.includes("limitedEdition");
  const presentation = resolveCatalogAvailabilityPresentation(product);
  const soldOut = presentation === "sold_out";
  const mtoAvailable = presentation === "made_to_order_available";
  const href = withBasePath(basePath, catalogCardHref(product));

  const primaryBadge = isNew
    ? badges.new
    : isFeatured
      ? badges.featured
      : isSale
        ? badges.sale
        : isBestseller
          ? badges.bestseller
          : isLimited
            ? badges.limitedEdition
            : null;

  return (
    <Link href={href} className="group cursor-pointer block">
      <article>
        <div className="relative aspect-[3/4] overflow-hidden border-2 border-transparent bg-surface transition-colors duration-200 group-hover:border-primary">
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
            <span className="absolute left-0 top-0 bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-background">
              {primaryBadge}
            </span>
          ) : null}
          {product.discountPercent != null && product.discountPercent > 0 ? (
            <span className="absolute right-0 top-0 bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-background">
              −{product.discountPercent}%
            </span>
          ) : null}
          {mtoAvailable ? (
            <span className="absolute inset-x-0 bottom-0 bg-primary/80 py-2 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-background">
              {productUi.buyMadeToOrderCta}
            </span>
          ) : soldOut ? (
            <span className="absolute inset-x-0 bottom-0 bg-primary/80 py-2 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-background">
              {productUi.outOfStock}
            </span>
          ) : null}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-tight transition-colors duration-200 group-hover:text-primary md:text-xl">
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
