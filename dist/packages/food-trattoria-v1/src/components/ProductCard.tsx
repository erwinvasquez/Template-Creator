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
      className="trattoria-shop-card group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-background transition-shadow duration-200 hover:shadow-[0_16px_40px_-16px_rgba(124,45,18,0.22)]"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          {(product.isNew || product.isFeatured) && (
            <span className="absolute left-3 top-3 rounded-full border border-secondary/40 bg-background/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary backdrop-blur-sm">
              {product.isNew ? newLabel : featuredLabel}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col border-t border-border p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
            {product.categoryLabel}
          </p>
          <h3 className="mt-2 font-serif text-xl leading-tight text-primary md:text-2xl">
            {product.name}
          </h3>
          <p className="mt-auto pt-4 font-serif text-lg text-primary">
            {formatPrice(
              product.price,
              payload.brand.locale,
              payload.brand.currency,
            )}
          </p>
        </div>
      </article>
    </Link>
  );
}
