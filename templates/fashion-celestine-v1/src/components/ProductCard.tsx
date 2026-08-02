"use client";

import Image from "next/image";
import Link from "next/link";
import type { ResolvedProduct } from "../content/types";
import { SHOP_PATH, formatPrice, withBasePath } from "../content/resolve";
import { useSiteContent } from "../lib/site-content";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ResolvedProduct;
  priority?: boolean;
}) {
  const { payload, basePath } = useSiteContent();
  const badges = payload.ui?.product?.badges;
  const newLabel = badges?.new ?? "Nueva temporada";
  const featuredLabel = badges?.featured ?? "Look firma";

  return (
    <Link
      href={withBasePath(basePath, `${SHOP_PATH}/${product.slug}`)}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-white transition-colors duration-200 hover:border-cta"
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[3/4] overflow-hidden bg-surface">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          {(product.isNew || product.isFeatured) && (
            <span className="absolute left-4 top-4 rounded-full bg-cta px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              {product.isNew ? newLabel : featuredLabel}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
            {product.categoryLabel}
          </p>
          <h3 className="mt-2 font-serif text-xl leading-tight text-primary transition-colors duration-200 group-hover:text-cta md:text-2xl">
            {product.name}
          </h3>
          <p className="mt-2 text-xs text-muted">
            {[...product.colors.slice(0, 2), ...product.sizes.slice(0, 2)].join(
              " · ",
            )}
          </p>
          <p className="mt-auto border-t border-border pt-4 font-serif text-lg text-primary">
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
