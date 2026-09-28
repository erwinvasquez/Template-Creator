"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import {
  SHOP_PATH,
  getLanesCollections,
  withBasePath,
} from "../content/resolve";
import { Reveal } from "./Reveal";

export function TacoLanes() {
  const { payload, basePath } = useSiteContent();
  const { lanes } = payload.sections;
  const items = getLanesCollections(payload);
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="max-w-xl">
          <p data-wb-slot="lanes.eyebrow" className="cantina-eyebrow">
            {lanes.eyebrow}
          </p>
          <h2
            data-wb-slot="lanes.title"
            className="mt-3 font-serif text-4xl font-bold uppercase leading-tight text-balance text-primary md:text-5xl"
          >
            {lanes.title}
          </h2>
        </div>
      </Reveal>

      <div className="category-scroll -mx-6 mt-12 flex gap-4 overflow-x-auto px-6 pb-4 md:-mx-10 md:gap-6 md:px-10 snap-x snap-mandatory">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 80} className="shrink-0 snap-start">
            <Link
              href={withBasePath(
                basePath,
                `${SHOP_PATH}?coleccion=${item.slug}`,
              )}
              className="group relative block h-[420px] w-[min(78vw,320px)] cursor-pointer overflow-hidden rounded-3xl border-4 border-primary shadow-[8px_8px_0_0_var(--color-secondary)]"
            >
              <Image
                src={item.imageUrl}
                alt={item.imageAlt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-serif text-2xl text-white">{item.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/70">
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
