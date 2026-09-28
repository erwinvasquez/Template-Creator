"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "../lib/site-content";
import { getMercadoProducts, withBasePath } from "../content/resolve";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function MercadoStrip() {
  const { payload, basePath } = useSiteContent();
  const { mercado } = payload.sections;
  const products = getMercadoProducts(payload);
  if (!products.length) return null;

  const [featured, ...rest] = products;

  return (
    <section className="bg-surface/50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p data-wb-slot="mercado.eyebrow" className="cantina-eyebrow">
                {mercado.eyebrow}
              </p>
              <h2
                data-wb-slot="mercado.title"
                className="mt-3 font-serif text-4xl font-bold uppercase leading-tight text-primary md:text-5xl"
              >
                {mercado.title}
              </h2>
            </div>
            {mercado.viewAll ? (
              <Link
                href={withBasePath(basePath, mercado.viewAll.href)}
                data-wb-slot="mercado.viewAll"
                className="group inline-flex shrink-0 cursor-pointer items-center gap-2 bg-primary px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-background transition-colors duration-200 hover:bg-primary/90"
              >
                {mercado.viewAll.label}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </Link>
            ) : null}
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="cantina-featured-card overflow-hidden rounded-2xl border-4 border-primary bg-background p-2">
              <ProductCard product={featured} priority />
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {rest.map((product, i) => (
              <Reveal key={product.id} delay={i * 70}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
