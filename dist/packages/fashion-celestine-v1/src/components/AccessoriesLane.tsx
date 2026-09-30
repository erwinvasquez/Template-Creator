"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "../lib/site-content";
import {
  getAccessoryProducts,
  withBasePath,
} from "../content/resolve";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function AccessoriesLane() {
  const { payload, basePath } = useSiteContent();
  const { accessories } = payload.sections;
  const products = getAccessoryProducts(payload);
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p data-wb-slot="accessories.eyebrow" className="celestine-eyebrow">
              {accessories.eyebrow}
            </p>
            <h2
              data-wb-slot="accessories.title"
              className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
            >
              {accessories.title}
            </h2>
            <p
              data-wb-slot="accessories.body"
              className="mt-4 text-base leading-relaxed text-muted"
            >
              {accessories.body}
            </p>
          </div>
          {accessories.cta ? (
            <Link
              href={withBasePath(basePath, accessories.cta.href)}
              data-wb-slot="accessories.cta"
              className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors duration-200 hover:text-primary"
            >
              {accessories.cta.label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={1.75}
              />
            </Link>
          ) : null}
        </div>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-3">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={i * 80}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
