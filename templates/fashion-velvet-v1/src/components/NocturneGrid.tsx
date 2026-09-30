"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "../lib/site-content";
import {
  getNocturneProducts,
  withBasePath,
} from "../content/resolve";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function NocturneGrid() {
  const { payload, basePath } = useSiteContent();
  const { nocturne } = payload.sections;
  const products = getNocturneProducts(payload);
  if (!products.length) return null;
  const [hero, ...rest] = products;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="mb-12 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p data-wb-slot="nocturne.eyebrow" className="velvet-eyebrow">
              {nocturne.eyebrow}
            </p>
            <h2
              data-wb-slot="nocturne.title"
              className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
            >
              {nocturne.title}
            </h2>
          </div>
          {nocturne.viewAll ? (
            <Link
              href={withBasePath(basePath, nocturne.viewAll.href)}
              data-wb-slot="nocturne.viewAll"
              className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors duration-200 hover:text-secondary"
            >
              {nocturne.viewAll.label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={1.75}
              />
            </Link>
          ) : null}
        </div>
      </Reveal>

      {hero ? (
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <ProductCard product={hero} priority />
            </Reveal>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            {rest.map((product, i) => (
              <Reveal key={product.id} delay={i * 70}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
