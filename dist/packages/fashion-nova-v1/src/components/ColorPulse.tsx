"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "../lib/site-content";
import {
  getColorPulseProducts,
  withBasePath,
} from "../content/resolve";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function ColorPulse() {
  const { payload, basePath } = useSiteContent();
  const { colorPulse } = payload.sections;
  const products = getColorPulseProducts(payload);
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="mb-12 flex flex-col gap-6 border-b-2 border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p data-wb-slot="colorPulse.eyebrow" className="nova-eyebrow">
              {colorPulse.eyebrow}
            </p>
            <h2
              data-wb-slot="colorPulse.title"
              className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] text-balance text-text md:text-5xl"
            >
              {colorPulse.title}
            </h2>
          </div>
          {colorPulse.viewAll ? (
            <Link
              href={withBasePath(basePath, colorPulse.viewAll.href)}
              data-wb-slot="colorPulse.viewAll"
              className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary transition-colors duration-200 hover:text-secondary"
            >
              {colorPulse.viewAll.label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </Link>
          ) : null}
        </div>
      </Reveal>

      <div className="nova-pulse-grid">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={i * 70}>
            <div className={i === 0 ? "h-full" : ""}>
              <ProductCard product={product} priority={i < 2} />
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
