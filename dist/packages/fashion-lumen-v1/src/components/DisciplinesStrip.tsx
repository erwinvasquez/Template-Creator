"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { getHomeDisciplines, withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function DisciplinesStrip() {
  const { payload, basePath } = useSiteContent();
  const disciplines = payload.sections.disciplines;
  const collections = getHomeDisciplines(payload);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-8 md:py-28">
      <Reveal>
        <div className="mb-12 max-w-xl">
          <p
            data-wb-slot="disciplines.eyebrow"
            className="text-[11px] font-bold uppercase tracking-[0.24em] text-secondary"
          >
            {disciplines.eyebrow}
          </p>
          <h2
            data-wb-slot="disciplines.title"
            className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-balance md:text-5xl"
          >
            {disciplines.title}
          </h2>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        {collections.map((collection, i) => (
          <Reveal key={collection.slug} delay={i * 100}>
            <Link
              href={withBasePath(basePath, `/tienda?coleccion=${collection.slug}`)}
              className="group relative block aspect-[4/5] cursor-pointer overflow-hidden border-2 border-primary"
            >
              <Image
                src={collection.imageUrl}
                alt={collection.imageAlt}
                fill
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white md:text-3xl">
                  {collection.name}
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-white/90">
                  {collection.description}
                </p>
                {disciplines.itemCtaLabel ? (
                  <span
                    data-wb-slot="disciplines.itemCtaLabel"
                    className="mt-4 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-secondary"
                  >
                    {disciplines.itemCtaLabel}
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
