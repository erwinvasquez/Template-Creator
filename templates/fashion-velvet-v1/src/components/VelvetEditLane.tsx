"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "../lib/site-content";
import {
  getVelvetEditProducts,
  withBasePath,
} from "../content/resolve";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function VelvetEditLane() {
  const { payload, basePath } = useSiteContent();
  const { velvetEdit } = payload.sections;
  const products = getVelvetEditProducts(payload);
  if (!products.length) return null;

  return (
    <section className="velvet-band-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p data-wb-slot="velvetEdit.eyebrow" className="velvet-eyebrow">
                {velvetEdit.eyebrow}
              </p>
              <h2
                data-wb-slot="velvetEdit.title"
                className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
              >
                {velvetEdit.title}
              </h2>
              <p
                data-wb-slot="velvetEdit.body"
                className="mt-4 text-sm leading-relaxed text-muted"
              >
                {velvetEdit.body}
              </p>
            </div>
            {velvetEdit.cta ? (
              <Link
                href={withBasePath(basePath, velvetEdit.cta.href)}
                data-wb-slot="velvetEdit.cta"
                className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors duration-200 hover:text-secondary"
              >
                {velvetEdit.cta.label}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  strokeWidth={1.75}
                />
              </Link>
            ) : null}
          </div>
        </Reveal>

        <div className="category-scroll -mx-6 flex gap-5 overflow-x-auto px-6 pb-2 md:-mx-10 md:px-10">
          {products.map((product, i) => (
            <div key={product.id} className="w-[15rem] shrink-0 md:w-[17rem]">
              <Reveal delay={i * 70}>
                <ProductCard product={product} />
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
