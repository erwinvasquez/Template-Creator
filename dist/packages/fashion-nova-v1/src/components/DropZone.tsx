"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import {
  SHOP_PATH,
  getDropZoneCollections,
  withBasePath,
} from "../content/resolve";
import { Reveal } from "./Reveal";

export function DropZone() {
  const { payload, basePath } = useSiteContent();
  const { dropZone } = payload.sections;
  const items = getDropZoneCollections(payload);
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p data-wb-slot="dropZone.eyebrow" className="nova-eyebrow">
              {dropZone.eyebrow}
            </p>
            <h2
              data-wb-slot="dropZone.title"
              className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] text-balance text-text md:text-5xl"
            >
              {dropZone.title}
            </h2>
          </div>
          <div className="hidden h-16 w-16 border-4 border-secondary md:block" aria-hidden />
        </div>
      </Reveal>

      <div className="nova-drop-bento mt-12">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 70}>
            <Link
              href={withBasePath(
                basePath,
                `${SHOP_PATH}?coleccion=${item.slug}`,
              )}
              className="group relative block h-full min-h-[220px] cursor-pointer overflow-hidden border-2 border-border bg-surface transition-colors duration-300 hover:border-primary"
            >
              <Image
                src={item.imageUrl}
                alt={item.imageAlt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                  Drop
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold uppercase text-white md:text-3xl">
                  {item.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-white/75">
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
