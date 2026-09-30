"use client";

import Image from "next/image";
import Link from "next/link";
import type { ResolvedProduct } from "../content/types";
import { formatPrice, withBasePath } from "../content/resolve";
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

  return (
    <Link
      href={withBasePath(basePath, `/tienda/${product.slug}`)}
      className="group cursor-pointer block"
    >
      <article>
        <div className="relative aspect-[3/4] overflow-hidden bg-surface">
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
          {(product.isNew || product.isFeatured) && (
            <span className="absolute left-3 top-3 bg-background/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
              {product.isNew ? badges.new : badges.featured}
            </span>
          )}
        </div>
        <div className="mt-4 space-y-1 text-center md:text-left">
          <h3 className="font-serif text-lg font-normal leading-tight transition-colors duration-200 group-hover:text-secondary md:text-xl">
            {product.name}
          </h3>
          <p className="text-sm font-light text-muted">
            {formatPrice(product.price, payload.brand.locale, payload.brand.currency)}
          </p>
        </div>
      </article>
    </Link>
  );
}
