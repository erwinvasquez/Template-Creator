"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { getGearSpotlight, withBasePath } from "../content/resolve";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function GearSpotlight() {
  const { payload, basePath } = useSiteContent();
  const gearSpotlight = payload.sections.gearSpotlight;
  const products = getGearSpotlight(payload);

  return (
    <section className="bg-surface/60 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <Reveal>
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p
                data-wb-slot="gearSpotlight.eyebrow"
                className="text-[11px] font-bold uppercase tracking-[0.24em] text-cta"
              >
                {gearSpotlight.eyebrow}
              </p>
              <h2
                data-wb-slot="gearSpotlight.title"
                className="mt-3 font-display text-4xl font-bold uppercase tracking-tight md:text-5xl"
              >
                {gearSpotlight.title}
              </h2>
            </div>
            {gearSpotlight.viewAll && (
              <Link
                href={withBasePath(basePath, gearSpotlight.viewAll.href)}
                data-wb-slot="gearSpotlight.viewAll"
                className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-primary hover:decoration-cta"
              >
                {gearSpotlight.viewAll.label}
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
