"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { getHomeCollections, withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function CollectionStrip() {
  const { payload, basePath } = useSiteContent();
  const { collections: section } = payload.sections;
  const collections = getHomeCollections(payload);
  if (!collections.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
      <Reveal>
        <div className="mb-12 max-w-xl">
          <p
            data-wb-slot="collections.eyebrow"
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary"
          >
            {section.eyebrow}
          </p>
          <h2
            data-wb-slot="collections.title"
            className="mt-3 font-serif text-4xl tracking-wide text-balance md:text-5xl"
          >
            {section.title}
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-3">
        {collections.map((collection, i) => (
          <Reveal key={collection.slug} delay={i * 100}>
            <Link
              href={withBasePath(basePath, `/tienda?coleccion=${collection.slug}`)}
              className="group relative block aspect-[4/5] cursor-pointer overflow-hidden"
            >
              <Image
                src={collection.imageUrl}
                alt={collection.imageAlt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {/* Scrim bajo el copy: contraste ≥4.5:1 (ui-ux-pro-max), sin apagar la foto */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <h3 className="font-serif text-3xl tracking-wide text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)]">
                  {collection.name}
                </h3>
                <p className="mt-2 text-sm font-normal leading-relaxed text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
                  {collection.description}
                </p>
                {section.itemCtaLabel ? (
                  <span
                    data-wb-slot="collections.itemCtaLabel"
                    className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-white underline decoration-white/55 underline-offset-4 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)] transition-colors duration-200 group-hover:decoration-primary"
                  >
                    {section.itemCtaLabel}
                  </span>
                ) : null}
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
