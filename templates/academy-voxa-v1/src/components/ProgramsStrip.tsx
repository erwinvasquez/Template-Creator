"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSiteContent } from "../lib/site-content";
import { requireUi } from "../lib/ui";
import {
  SHOP_PATH,
  formatPrice,
  getProgramProducts,
  withBasePath,
} from "../content/resolve";
import { Reveal } from "./Reveal";

export function ProgramsStrip() {
  const { payload, basePath } = useSiteContent();
  const ui = requireUi(payload);
  const { programs } = payload.sections;
  const products = getProgramProducts(payload);
  if (!products.length) return null;
  const badges = ui.product.badges;

  return (
    <section
      id="programs"
      className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28"
    >
      <Reveal>
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p
              data-wb-slot="programs.eyebrow"
              className="voxa-rule text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary"
            >
              {programs.eyebrow}
            </p>
            <h2
              data-wb-slot="programs.title"
              className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
            >
              {programs.title}
            </h2>
          </div>
          <Link
            href={withBasePath(basePath, SHOP_PATH)}
            className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors duration-200 hover:text-primary"
          >
            {ui.cart.exploreCta}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={1.75}
            />
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-3">
        {products.map((product, i) => {
          const badgeLabel = product.isNew
            ? badges.new
            : product.isLimited
              ? badges.limitedEdition
              : null;

          return (
            <Reveal key={product.id} delay={i * 100}>
              <Link
                href={withBasePath(basePath, `${SHOP_PATH}/${product.slug}`)}
                className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-white transition-colors duration-200 hover:border-cta"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <Image
                    src={product.imageUrl}
                    alt={product.imageAlt}
                    fill
                    priority={i === 0}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {badgeLabel && (
                    <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-background">
                      {badgeLabel}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
                    {product.categoryLabel}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl leading-tight text-primary transition-colors duration-200 group-hover:text-primary">
                    {product.name}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[...product.sizes, ...product.metals].map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-surface px-3 py-1 text-[11px] font-medium text-secondary"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="mt-6 flex items-baseline gap-2 border-t border-border pt-5 text-sm text-muted">
                    <span className="font-serif text-xl text-primary">
                      {formatPrice(
                        product.price,
                        payload.brand.locale,
                        payload.brand.currency,
                      )}
                    </span>
                  </p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
