"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function SquadStrip() {
  const { payload, basePath } = useSiteContent();
  const { squad } = payload.sections;

  return (
    <section className="nova-squad-split nova-block-invert">
      <div className="flex flex-col justify-center bg-primary px-6 py-16 md:px-10 md:py-24">
        <Reveal>
          <p
            data-wb-slot="squad.eyebrow"
            className="text-[11px] font-bold uppercase tracking-[0.22em] text-background/80"
          >
            {squad.eyebrow}
          </p>
          <h2
            data-wb-slot="squad.title"
            className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] text-balance text-background md:text-5xl"
          >
            {squad.title}
          </h2>
        </Reveal>
      </div>

      <div className="flex flex-col justify-center px-6 py-16 md:px-12 md:py-24">
        <Reveal delay={100}>
          <p
            data-wb-slot="squad.body"
            className="max-w-lg text-base leading-relaxed text-white/75"
          >
            {squad.body}
          </p>
          <Link
            href={withBasePath(basePath, squad.cta.href)}
            data-wb-slot="squad.cta"
            className="mt-10 inline-flex cursor-pointer border-2 border-secondary bg-transparent px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary transition-colors duration-200 hover:bg-secondary hover:text-ink"
          >
            {squad.cta.label}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
