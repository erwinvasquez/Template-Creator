"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { getArrivalsProducts, withBasePath } from "../content/resolve";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function ArrivalsGrid() {
  const { payload, basePath } = useSiteContent();
  const arrivals = payload.sections.arrivals;
  const products = getArrivalsProducts(payload);
  if (!products.length) return null;

  return (
    <section className="border-y border-border bg-surface/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <Reveal>
          <div className="mb-14 flex flex-col items-center justify-between gap-6 text-center md:flex-row md:items-end md:text-left">
            <div>
              <p
                data-wb-slot="arrivals.eyebrow"
                className="text-[11px] font-medium uppercase tracking-[0.22em] text-secondary"
              >
                {arrivals.eyebrow}
              </p>
              <h2
                data-wb-slot="arrivals.title"
                className="mt-3 font-serif text-4xl font-normal leading-tight md:text-5xl"
              >
                {arrivals.title}
              </h2>
            </div>
            {arrivals.viewAll && (
              <Link
                href={withBasePath(basePath, arrivals.viewAll.href)}
                data-wb-slot="arrivals.viewAll"
                className="cursor-pointer text-[11px] font-medium uppercase tracking-[0.16em] text-muted underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-primary hover:decoration-secondary"
              >
                {arrivals.viewAll.label}
              </Link>
            )}
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4 md:gap-x-8">
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
