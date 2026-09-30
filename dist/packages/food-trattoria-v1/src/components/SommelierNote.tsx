"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function SommelierNote() {
  const { payload, basePath } = useSiteContent();
  const { sommelier } = payload.sections;

  return (
    <section className="grid md:grid-cols-2">
      <div className="trattoria-sommelier-panel relative flex min-h-[280px] items-center justify-center px-6 py-16 md:min-h-0 md:px-12 md:py-24">
        <div className="trattoria-sommelier-ring h-32 w-32 rounded-full border-4 border-secondary/40 md:h-40 md:w-40" />
      </div>
      <div className="flex items-center bg-background px-6 py-16 md:px-12 md:py-24">
        <Reveal>
          <p
            data-wb-slot="sommelier.eyebrow"
            className="trattoria-eyebrow"
          >
            {sommelier.eyebrow}
          </p>
          <h2
            data-wb-slot="sommelier.title"
            className="mt-4 font-serif text-3xl leading-tight text-balance text-primary md:text-4xl"
          >
            {sommelier.title}
          </h2>
          <p
            data-wb-slot="sommelier.body"
            className="mt-5 text-base leading-relaxed text-muted"
          >
            {sommelier.body}
          </p>
          <Link
            href={withBasePath(basePath, sommelier.cta.href)}
            data-wb-slot="sommelier.cta"
            className="mt-8 inline-flex cursor-pointer rounded-full bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-background transition-colors duration-200 hover:bg-primary/90"
          >
            {sommelier.cta.label}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
