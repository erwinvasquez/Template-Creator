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
      className="cantina-shop-card group flex h-full cursor-pointer flex-col border-2 border-primary bg-background shadow-[6px_6px_0_0_var(--color-secondary)] transition-transform duration-200 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--color-secondary)]"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-square overflow-hidden bg-surface">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          {(product.isNew || product.isFeatured) && (
            <span className="absolute left-0 top-0 bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-background">
              {product.isNew ? newLabel : featuredLabel}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col border-t-2 border-primary p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
            {product.categoryLabel}
          </p>
          <h3 className="mt-1 font-serif text-lg font-bold uppercase leading-tight tracking-tight text-primary md:text-xl">
            {product.name}
          </h3>
          <p className="mt-auto pt-3 text-xl font-bold text-primary">
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
