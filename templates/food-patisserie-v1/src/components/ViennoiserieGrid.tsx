"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import {
  SHOP_PATH,
  getViennoiserieCollections,
  withBasePath,
} from "../content/resolve";
import { Reveal } from "./Reveal";

export function ViennoiserieGrid() {
  const { payload, basePath } = useSiteContent();
  const { viennoiserie } = payload.sections;
  const items = getViennoiserieCollections(payload);
  if (!items.length) return null;

  const [hero, ...rest] = items;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="mx-auto max-w-xl text-center md:mx-0 md:text-left">
          <p data-wb-slot="viennoiserie.eyebrow" className="patisserie-eyebrow">
            {viennoiserie.eyebrow}
          </p>
          <h2
            data-wb-slot="viennoiserie.title"
            className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
          >
            {viennoiserie.title}
          </h2>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-2 md:grid-rows-2 md:gap-5">
        <Reveal className="md:row-span-2">
          <Link
            href={withBasePath(
              basePath,
              `${SHOP_PATH}?coleccion=${hero.slug}`,
            )}
            className="group patisserie-collection-card relative block aspect-[4/5] cursor-pointer overflow-hidden rounded-[1.75rem] md:aspect-auto md:h-full md:min-h-[480px]"
          >
            <Image
              src={hero.imageUrl}
              alt={hero.imageAlt}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <h3 className="font-serif text-3xl text-background md:text-4xl">
                {hero.name}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-background/80">
                {hero.description}
              </p>
            </div>
          </Link>
        </Reveal>

        {rest.map((item, i) => (
          <Reveal key={item.id} delay={i * 80}>
            <Link
              href={withBasePath(
                basePath,
                `${SHOP_PATH}?coleccion=${item.slug}`,
              )}
              className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-surface/50 p-4 transition-colors duration-200 hover:bg-surface md:p-5"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-xl text-primary">{item.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {item.description}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
