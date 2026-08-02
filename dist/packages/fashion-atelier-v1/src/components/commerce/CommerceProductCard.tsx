"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductCardViewModel } from "@shopenlinea/commerce-runtime-contract";
import { useSiteContent } from "../../lib/site-content";
import { withBasePath } from "../../content/resolve";

export function CommerceProductCard({
  product,
  priority = false,
}: {
  product: ProductCardViewModel;
  priority?: boolean;
}) {
  const { payload, basePath } = useSiteContent();
  const badges = payload.ui?.product?.badges;
  const newLabel = badges?.new ?? "Nuevo";
  const featuredLabel = badges?.featured ?? "Destacado";
  const saleLabel = badges?.sale ?? "Oferta";
  const bestsellerLabel = badges?.bestseller ?? "Más vendido";
  const limitedLabel = badges?.limitedEdition ?? "Edición limitada";
  const outOfStockLabel =
    payload.ui?.product?.outOfStock ?? "Agotado";

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
    ? newLabel
    : isFeatured
      ? featuredLabel
      : isSale
        ? saleLabel
        : isBestseller
          ? bestsellerLabel
          : isLimited
            ? limitedLabel
            : null;

  return (
    <Link href={href} className="group cursor-pointer block">
      <article>
        <div className="relative aspect-[3/4] overflow-hidden bg-surface">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority={priority}
              className={`object-cover transition-opacity duration-500 group-hover:opacity-0 ${
                isOut ? "opacity-60" : ""
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
            <span className="absolute left-3 top-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white">
              {primaryBadge}
            </span>
          ) : null}
          {product.discountPercent != null && product.discountPercent > 0 ? (
            <span className="absolute right-3 top-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              −{product.discountPercent}%
            </span>
          ) : null}
          {isOut ? (
            <span className="absolute inset-x-0 bottom-0 bg-primary/80 py-2 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-background">
              {outOfStockLabel}
            </span>
          ) : null}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="font-serif text-xl leading-tight tracking-wide transition-colors duration-200 group-hover:text-cta md:text-[1.35rem]">
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
