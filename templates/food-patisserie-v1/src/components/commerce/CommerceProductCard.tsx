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
  const isOut = product.stockLabel === "out_of_stock";
  const href = withBasePath(
    basePath,
    product.href.startsWith("/") ? product.href : `/${product.href}`,
  );

  const primaryBadge = isNew ? badges.new : isFeatured ? badges.featured : null;
  const eyebrow = product.categoryLabels?.[0] ?? null;

  return (
    <Link
      href={href}
      className="patisserie-shop-card group flex cursor-pointer gap-4 rounded-2xl border border-border/80 bg-background p-4 shadow-sm transition-all duration-200 hover:shadow-[0_12px_32px_-12px_rgba(120,53,15,0.18)] md:gap-6 md:p-5"
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-surface md:h-32 md:w-32">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority={priority}
            className={`object-cover ${isOut ? "opacity-50" : ""}`}
            sizes="128px"
          />
        )}
        {primaryBadge ? (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-background">
            {primaryBadge}
          </span>
        ) : null}
      </div>
      <article className="flex min-w-0 flex-1 flex-col justify-center">
        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-1 font-serif text-xl leading-tight text-primary md:text-2xl">
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-medium text-primary">
          {product.displayPrice}
          {product.compareAtPrice ? (
            <span className="ml-2 text-sm text-muted line-through">
              {product.compareAtPrice}
            </span>
          ) : null}
        </p>
        {isOut ? (
          <p className="mt-1 text-xs text-muted">{productUi.outOfStock}</p>
        ) : null}
      </article>
    </Link>
  );
}
