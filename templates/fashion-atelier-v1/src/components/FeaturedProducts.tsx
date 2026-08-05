"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { getFeaturedProducts, withBasePath } from "../content/resolve";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function FeaturedProducts() {
  const { payload, basePath } = useSiteContent();
  const { featured } = payload.sections;
  const products = getFeaturedProducts(payload);

  return (
    <section className="bg-surface/60 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <Reveal>
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p
                data-wb-slot="featured.eyebrow"
                className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary"
              >
                {featured.eyebrow}
              </p>
              <h2
                data-wb-slot="featured.title"
                className="mt-3 font-serif text-4xl tracking-wide md:text-5xl"
              >
                {featured.title}
              </h2>
            </div>
            {featured.viewAll && (
              <Link
                href={withBasePath(basePath, featured.viewAll.href)}
                data-wb-slot="featured.viewAll"
                className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-primary hover:decoration-primary"
              >
                {featured.viewAll.label}
              </Link>
            )}
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 md:gap-x-6">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) * 80}>
              <ProductCard product={product} priority={i < 2} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
