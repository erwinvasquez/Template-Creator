"use client";

import Image from "next/image";
import Link from "next/link";
import type { ResolvedProduct } from "../content/types";
import { SHOP_PATH, formatPrice, withBasePath } from "../content/resolve";
import { useSiteContent } from "../lib/site-content";
import { requireUi } from "../lib/ui";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ResolvedProduct;
  priority?: boolean;
}) {
  const { payload, basePath } = useSiteContent();
  const badges = requireUi(payload).product.badges;
  const newLabel = badges.new;
  const featuredLabel = badges.featured;

  return (
    <Link
      href={withBasePath(basePath, `${SHOP_PATH}/${product.slug}`)}
      className="patisserie-shop-card group flex cursor-pointer gap-4 rounded-2xl border border-border/80 bg-background p-4 shadow-sm transition-all duration-200 hover:shadow-[0_12px_32px_-12px_rgba(120,53,15,0.18)] md:gap-6 md:p-5"
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-surface md:h-32 md:w-32">
        <Image
          src={product.imageUrl}
          alt={product.imageAlt}
          fill
          priority={priority}
          className="object-cover"
          sizes="128px"
        />
        {(product.isNew || product.isFeatured) && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-background">
            {product.isNew ? newLabel : featuredLabel}
          </span>
        )}
      </div>
      <article className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary">
          {product.categoryLabel}
        </p>
        <h3 className="mt-1 font-serif text-xl leading-tight text-primary md:text-2xl">
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-medium text-primary">
          {formatPrice(
            product.price,
            payload.brand.locale,
            payload.brand.currency,
          )}
        </p>
      </article>
    </Link>
  );
}
