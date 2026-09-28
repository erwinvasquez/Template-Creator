"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import {
  SHOP_PATH,
  getSoireesCollections,
  withBasePath,
} from "../content/resolve";
import { Reveal } from "./Reveal";

function MarqueeCard({
  href,
  name,
  description,
  imageUrl,
  imageAlt,
}: {
  href: string;
  name: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}) {
  return (
    <Link
      href={href}
      className="group relative mx-3 block h-[22rem] w-[16rem] shrink-0 cursor-pointer overflow-hidden md:h-[26rem] md:w-[18rem]"
    >
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        sizes="18rem"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 border-t border-secondary/40 bg-ink/55 p-5 backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-secondary">
          Colección
        </p>
        <h3 className="mt-2 font-serif text-2xl text-white">{name}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/65">
          {description}
        </p>
      </div>
    </Link>
  );
}

export function SoireesMarquee() {
  const { payload, basePath } = useSiteContent();
  const { soirees } = payload.sections;
  const items = getSoireesCollections(payload);
  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <section className="overflow-hidden border-y border-border bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p data-wb-slot="soirees.eyebrow" className="velvet-eyebrow">
                {soirees.eyebrow}
              </p>
              <h2
                data-wb-slot="soirees.title"
                className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
              >
                {soirees.title}
              </h2>
            </div>
            <p className="max-w-xs text-xs uppercase tracking-[0.18em] text-muted">
              Desliza para explorar
            </p>
          </div>
        </Reveal>
      </div>

      <div className="relative mt-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent md:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent md:w-24" />
        <div className="velvet-marquee-track flex w-max">
          {loop.map((item, i) => (
            <MarqueeCard
              key={`${item.id}-${i}`}
              href={withBasePath(
                basePath,
                `${SHOP_PATH}?coleccion=${item.slug}`,
              )}
              name={item.name}
              description={item.description}
              imageUrl={item.imageUrl}
              imageAlt={item.imageAlt}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
