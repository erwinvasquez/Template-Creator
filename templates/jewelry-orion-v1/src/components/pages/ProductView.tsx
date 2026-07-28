"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useSiteContent } from "../../lib/site-content";
import {
  formatPrice,
  getProductBySlug,
  resolveProducts,
  withBasePath,
} from "../../content/resolve";
import { AddToCartForm } from "../AddToCartForm";
import { ProductCard } from "../ProductCard";

export function ProductView({ slug }: { slug: string }) {
  const { payload, basePath } = useSiteContent();
  const product = getProductBySlug(payload, slug);

  if (!product) {
    notFound();
  }

  const related = resolveProducts(payload)
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  const badges = payload.ui?.product?.badges;
  const newLabel = badges?.new ?? "Nuevo";
  const limitedLabel = badges?.limited ?? "Edición limitada";
  const relatedTitle = payload.ui?.product?.relatedTitle ?? "Más piezas de esta categoría";
  const shippingNote = payload.ui?.product?.shippingNote ?? "Envío asegurado en 3–5 días laborables";
  const shopLabel =
    payload.navigation.primary.find((l) => l.href === "/coleccion")?.label ?? "Colección";

  return (
    <div className="pb-24 pt-12 md:pt-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2 md:gap-16 md:px-10">
        <div className="relative aspect-square overflow-hidden bg-surface">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="flex flex-col md:py-8">
          <nav className="mb-6 text-xs text-muted" aria-label="Breadcrumb">
            <Link
              href={withBasePath(basePath, "/coleccion")}
              className="cursor-pointer transition-colors duration-200 hover:text-primary"
            >
              {shopLabel}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-primary">{product.name}</span>
          </nav>

          {(product.isNew || product.isLimited) && (
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-cta">
              {product.isNew ? newLabel : limitedLabel}
            </p>
          )}

          <h1 className="font-serif text-4xl tracking-wide md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 font-serif text-2xl">
            {formatPrice(product.price, payload.brand.locale, payload.brand.currency)}
          </p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted md:text-base">
            {product.description}
          </p>

          <div className="mt-10">
            <AddToCartForm product={product} />
          </div>

          <dl className="mt-12 space-y-3 border-t border-border pt-8 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Categoría</dt>
              <dd className="capitalize">{product.categoryLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Colección</dt>
              <dd>{product.collectionName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Envío</dt>
              <dd>{shippingNote}</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-24 max-w-7xl px-6 md:px-10">
          <h2 className="mb-10 font-serif text-3xl tracking-wide md:text-4xl">
            {relatedTitle}
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
