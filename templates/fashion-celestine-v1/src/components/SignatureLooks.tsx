"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "../lib/site-content";
import {
  getSignatureProducts,
  withBasePath,
} from "../content/resolve";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function SignatureLooks() {
  const { payload, basePath } = useSiteContent();
  const { signature } = payload.sections;
  const products = getSignatureProducts(payload);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p data-wb-slot="signature.eyebrow" className="celestine-eyebrow">
              {signature.eyebrow}
            </p>
            <h2
              data-wb-slot="signature.title"
              className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
            >
              {signature.title}
            </h2>
          </div>
          {signature.viewAll ? (
            <Link
              href={withBasePath(basePath, signature.viewAll.href)}
              data-wb-slot="signature.viewAll"
              className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors duration-200 hover:text-cta"
            >
              {signature.viewAll.label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                strokeWidth={1.75}
              />
            </Link>
          ) : null}
        </div>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={i * 70}>
            <ProductCard product={product} priority={i < 2} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
