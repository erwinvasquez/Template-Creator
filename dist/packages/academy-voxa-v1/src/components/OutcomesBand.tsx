"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { useSiteContent } from "../lib/site-content";
import { resolveMediaUrl } from "../content/resolve";
import { Reveal } from "./Reveal";

export function OutcomesBand() {
  const { payload } = useSiteContent();
  const { outcomes } = payload.sections;

  return (
    <section
      id="outcomes"
      className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-16 md:px-10 md:py-28"
    >
      <Reveal>
        <div className="max-w-xl">
          <p
            data-wb-slot="outcomes.eyebrow"
            className="voxa-rule text-[11px] font-semibold uppercase tracking-[0.2em] text-secondary"
          >
            {outcomes.eyebrow}
          </p>
          <h2
            data-wb-slot="outcomes.title"
            className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
          >
            {outcomes.title}
          </h2>
          <p
            data-wb-slot="outcomes.body"
            className="mt-5 text-base leading-relaxed text-muted"
          >
            {outcomes.body}
          </p>

          <ul data-wb-slot="outcomes.bullets" className="mt-8 space-y-4">
            {outcomes.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-secondary" strokeWidth={2.5} />
                </span>
                <span className="text-sm leading-relaxed text-secondary md:text-base">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface md:aspect-[4/5]">
          <Image
            src={resolveMediaUrl(outcomes.image, payload.media)}
            alt={outcomes.image.alt}
            fill
            data-wb-slot="outcomes.image"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </Reveal>
    </section>
  );
}
