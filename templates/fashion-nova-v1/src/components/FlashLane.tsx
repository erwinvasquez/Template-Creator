"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "../lib/site-content";
import {
  getFlashLaneProducts,
  withBasePath,
} from "../content/resolve";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function FlashLane() {
  const { payload, basePath } = useSiteContent();
  const { flashLane } = payload.sections;
  const products = getFlashLaneProducts(payload);
  if (!products.length) return null;

  return (
    <section className="border-t-2 border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p data-wb-slot="flashLane.eyebrow" className="nova-eyebrow">
                {flashLane.eyebrow}
              </p>
              <h2
                data-wb-slot="flashLane.title"
                className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] text-balance text-text md:text-5xl"
              >
                {flashLane.title}
              </h2>
              <p
                data-wb-slot="flashLane.body"
                className="mt-4 text-base leading-relaxed text-muted"
              >
                {flashLane.body}
              </p>
            </div>
            {flashLane.cta ? (
              <Link
                href={withBasePath(basePath, flashLane.cta.href)}
                data-wb-slot="flashLane.cta"
                className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary transition-colors duration-200 hover:text-primary"
              >
                {flashLane.cta.label}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </Link>
            ) : null}
          </div>
        </Reveal>

        <div className="nova-flash-rail -mx-6 px-6 md:-mx-10 md:px-10">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 80}>
              <div className="border-2 border-secondary/40 bg-surface p-3 transition-colors duration-300 hover:border-primary">
                <ProductCard product={product} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
