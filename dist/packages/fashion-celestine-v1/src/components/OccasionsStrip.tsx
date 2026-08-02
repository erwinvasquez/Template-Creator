"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import {
  SHOP_PATH,
  getOccasionCollections,
  withBasePath,
} from "../content/resolve";
import { Reveal } from "./Reveal";

export function OccasionsStrip() {
  const { payload, basePath } = useSiteContent();
  const { occasions } = payload.sections;
  const items = getOccasionCollections(payload);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="max-w-xl">
          <p data-wb-slot="occasions.eyebrow" className="celestine-eyebrow">
            {occasions.eyebrow}
          </p>
          <h2
            data-wb-slot="occasions.title"
            className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
          >
            {occasions.title}
          </h2>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 80}>
            <Link
              href={withBasePath(
                basePath,
                `${SHOP_PATH}?coleccion=${item.slug}`,
              )}
              className="group relative block aspect-[3/4] cursor-pointer overflow-hidden rounded-2xl"
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
