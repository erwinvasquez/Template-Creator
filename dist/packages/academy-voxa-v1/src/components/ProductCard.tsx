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
  const limitedLabel = badges.limitedEdition;

  return (
    <Link
      href={withBasePath(basePath, `${SHOP_PATH}/${product.slug}`)}
      className="group block cursor-pointer overflow-hidden rounded-xl border border-border bg-white transition-colors duration-200 hover:border-cta"
    >
      <article>
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            priority={priority}
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {product.hoverImageUrl && (
            <Image
              src={product.hoverImageUrl}
              alt=""
              fill
              aria-hidden
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          )}
          {(product.isNew || product.isLimited) && (
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-background">
              {product.isNew ? newLabel : limitedLabel}
            </span>
          )}
        </div>
        <div className="p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
            {product.categoryLabel}
          </p>
          <h3 className="mt-2 font-serif text-xl leading-tight text-primary transition-colors duration-200 group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mt-2 text-xs text-muted">
            {[...product.sizes, ...product.metals].join(" · ")}
          </p>
          <p className="mt-4 font-serif text-lg text-primary">
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
