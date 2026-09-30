"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import {
  SHOP_PATH,
  formatPrice,
  getBookProducts,
  withBasePath,
} from "../content/resolve";
import { Reveal } from "./Reveal";

export function BooksBand() {
  const { payload, basePath } = useSiteContent();
  const { books } = payload.sections;
  const products = getBookProducts(payload);
  if (!products.length) return null;

  return (
    <section id="books" className="voxa-band-ink py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p
                data-wb-slot="books.eyebrow"
                className="voxa-rule text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary"
              >
                {books.eyebrow}
              </p>
              <h2
                data-wb-slot="books.title"
                className="mt-3 font-serif text-4xl leading-tight text-balance md:text-5xl"
              >
                {books.title}
              </h2>
            </div>
            {books.cta && (
              <Link
                href={withBasePath(basePath, books.cta.href)}
                data-wb-slot="books.cta"
                className="inline-flex shrink-0 cursor-pointer border border-white/30 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:border-cta hover:bg-primary"
              >
                {books.cta.label}
              </Link>
            )}
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={i * 90}>
              <Link
                href={withBasePath(basePath, `${SHOP_PATH}/${product.slug}`)}
                className="group flex cursor-pointer gap-5 rounded-xl border border-white/10 bg-white/5 p-5 transition-colors duration-200 hover:border-cta/60 hover:bg-white/10"
              >
                <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-md bg-white/10">
                  <Image
                    src={product.imageUrl}
                    alt={product.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                    sizes="120px"
                  />
                </div>
                <div className="flex min-w-0 flex-col">
                  <h3 className="font-serif text-xl leading-tight transition-colors duration-200 group-hover:text-primary">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/50">
                    {product.metals.join(" · ")}
                  </p>
                  <p className="mt-auto pt-4 text-sm text-white/75">
                    {formatPrice(
                      product.price,
                      payload.brand.locale,
                      payload.brand.currency,
                    )}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
