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
  const limitedLabel = badges.limitedEdition;

  return (
    <Link
      href={withBasePath(basePath, `/coleccion/${product.slug}`)}
      className="group cursor-pointer block"
    >
      <article>
        <div className="relative aspect-square overflow-hidden bg-surface">
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
            <span className="absolute left-3 top-3 bg-ink/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white">
              {product.isNew ? badges.new : limitedLabel}
            </span>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="font-serif text-xl leading-tight tracking-wide transition-colors duration-200 group-hover:text-primary">
            {product.name}
          </h3>
          <p className="text-sm text-muted">
            {formatPrice(product.price, payload.brand.locale, payload.brand.currency)}
          </p>
        </div>
      </article>
    </Link>
  );
}
