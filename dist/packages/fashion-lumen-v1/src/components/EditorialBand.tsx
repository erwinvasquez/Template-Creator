"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function EditorialBand() {
  const { payload, basePath } = useSiteContent();
  const editorial = payload.sections.editorial;

  return (
    <section className="bg-ink py-20 text-background md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
        <Reveal>
          <p
            data-wb-slot="editorial.eyebrow"
            className="text-[11px] font-medium uppercase tracking-[0.22em] text-secondary"
          >
            {editorial.eyebrow}
          </p>
          <h2
            data-wb-slot="editorial.title"
            className="mt-5 font-serif text-3xl font-normal italic leading-snug text-balance md:text-5xl"
          >
            {editorial.title}
          </h2>
          <p
            data-wb-slot="editorial.body"
            className="mt-6 text-sm font-light leading-relaxed text-background/70 md:text-base"
          >
            {editorial.body}
          </p>
          {editorial.cta && (
            <Link
              href={withBasePath(basePath, editorial.cta.href)}
              data-wb-slot="editorial.cta"
              className="mt-10 inline-flex cursor-pointer border border-background/40 px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors duration-200 hover:border-background hover:bg-background/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
            >
              {editorial.cta.label}
            </Link>
          )}
        </Reveal>
      </div>
    </section>
  );
}
