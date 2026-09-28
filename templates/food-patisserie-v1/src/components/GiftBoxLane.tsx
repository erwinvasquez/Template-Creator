"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "../lib/site-content";
import { getViennoiserieProducts, withBasePath } from "../content/resolve";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function GiftBoxLane() {
  const { payload, basePath } = useSiteContent();
  const { giftBox } = payload.sections;
  const products = getViennoiserieProducts(payload);
  if (!products.length) return null;

  return (
    <section className="bg-surface/30 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p data-wb-slot="giftBox.eyebrow" className="patisserie-eyebrow">
                {giftBox.eyebrow}
              </p>
              <h2
                data-wb-slot="giftBox.title"
                className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
              >
                {giftBox.title}
              </h2>
              <p
                data-wb-slot="giftBox.body"
                className="mt-4 text-base leading-relaxed text-muted"
              >
                {giftBox.body}
              </p>
            </div>
            {giftBox.cta ? (
              <Link
                href={withBasePath(basePath, giftBox.cta.href)}
                data-wb-slot="giftBox.cta"
                className="group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-primary/30 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors duration-200 hover:bg-primary hover:text-background"
              >
                {giftBox.cta.label}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={1.75}
                />
              </Link>
            ) : null}
          </div>
        </Reveal>

        <div className="category-scroll -mx-6 flex gap-5 overflow-x-auto px-6 pb-4 md:-mx-10 md:gap-6 md:px-10">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 70} className="shrink-0 w-[min(78vw,280px)]">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
