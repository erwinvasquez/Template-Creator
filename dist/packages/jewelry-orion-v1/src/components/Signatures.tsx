"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { formatPrice, getSignatureProducts, withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function Signatures() {
  const { payload, basePath } = useSiteContent();
  const { signatures } = payload.sections;
  const products = getSignatureProducts(payload);
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="mb-12 max-w-xl">
          <p
            data-wb-slot="signatures.eyebrow"
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary"
          >
            {signatures.eyebrow}
          </p>
          <h2
            data-wb-slot="signatures.title"
            className="mt-3 font-serif text-4xl tracking-wide text-balance md:text-5xl"
          >
            {signatures.title}
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-3">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={i * 100}>
            <Link
              href={withBasePath(basePath, `/coleccion/${product.slug}`)}
              className="group block cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden bg-surface">
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt}
                  fill
                  priority={i === 0}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="font-serif text-2xl tracking-wide transition-colors duration-200 group-hover:text-primary">
                  {product.name}
                </h3>
                <span className="shrink-0 text-sm text-muted">
                  {formatPrice(product.price, payload.brand.locale, payload.brand.currency)}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
