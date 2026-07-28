"use client";

import Image from "next/image";
import { useSiteContent } from "../lib/site-content";
import { getMaterialItems } from "../content/resolve";
import { Reveal } from "./Reveal";

export function MaterialsRow() {
  const { payload } = useSiteContent();
  const { materials } = payload.sections;
  const items = getMaterialItems(payload);

  return (
    <section className="border-y border-border bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="mb-12 max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta">
              {materials.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-4xl tracking-wide text-balance md:text-5xl">
              {materials.title}
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 90}>
              <div className="group">
                <div className="relative aspect-square overflow-hidden bg-surface">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
                <h3 className="mt-4 font-serif text-xl tracking-wide">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
