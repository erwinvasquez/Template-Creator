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
        : null;

  const eyebrow = product.categoryLabels?.[0] ?? null;

  return (
    <Link
      href={href}
      className="cantina-shop-card group flex h-full cursor-pointer flex-col border-2 border-primary bg-background shadow-[6px_6px_0_0_var(--color-secondary)] transition-transform duration-200 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-secondary)]"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-square overflow-hidden bg-surface">
          {product.imageUrl && (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority={priority}
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isOut ? "opacity-50" : ""}`}
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          )}
          {primaryBadge ? (
            <span className="absolute left-0 top-0 bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-background">
              {primaryBadge}
            </span>
          ) : null}
          {product.discountPercent != null && product.discountPercent > 0 ? (
            <span className="absolute right-0 top-0 bg-secondary px-2 py-1 text-[10px] font-bold uppercase text-background">
              −{product.discountPercent}%
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col border-t-2 border-primary p-4">
          {eyebrow ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 font-serif text-lg font-bold uppercase leading-tight tracking-tight text-primary md:text-xl">
            {product.name}
          </h3>
          <p className="mt-auto pt-3 text-xl font-bold text-primary">
            {product.displayPrice}
          </p>
        </div>
      </article>
    </Link>
  );
}
