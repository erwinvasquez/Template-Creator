"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductCardViewModel } from "@shopenlinea/commerce-runtime-contract";
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
  const isOut = product.stockLabel === "out_of_stock";
  const href = withBasePath(
    basePath,
    product.href.startsWith("/") ? product.href : `/${product.href}`,
  );

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

  const eyebrow = product.categoryLabels?.[0] ?? null;

  return (
    <Link
      href={href}
      className="group flex h-full cursor-pointer flex-col overflow-hidden border border-border bg-white transition-colors duration-200 hover:border-secondary"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[3/4] overflow-hidden bg-surface">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority={priority}
              className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
                product.galleryPreview ? "group-hover:opacity-0" : ""
              } ${isOut ? "opacity-60" : ""}`}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          )}
          {product.galleryPreview && (
            <Image
              src={product.galleryPreview}
              alt=""
              fill
              aria-hidden
              className="object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          )}
          {primaryBadge ? (
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-background">
              {primaryBadge}
            </span>
          ) : null}
          {product.discountPercent != null && product.discountPercent > 0 ? (
            <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary shadow-sm backdrop-blur-sm">
              −{product.discountPercent}%
            </span>
          ) : null}
          {isOut ? (
            <span className="absolute inset-x-0 bottom-0 bg-primary/75 py-2 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-background">
              {productUi.outOfStock}
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-5">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-2 font-serif text-xl leading-tight text-primary transition-colors duration-200 group-hover:text-primary md:text-2xl">
            {product.name}
          </h3>
          <p className="mt-auto border-t border-border pt-4 font-serif text-lg text-primary">
            {product.displayPrice}
            {product.compareAtPrice ? (
              <span className="ml-2 text-sm font-sans text-muted line-through">
                {product.compareAtPrice}
              </span>
            ) : null}
          </p>
        </div>
      </article>
    </Link>
  );
}
