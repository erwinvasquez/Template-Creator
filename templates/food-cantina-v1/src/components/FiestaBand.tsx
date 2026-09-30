"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function FiestaBand() {
  const { payload, basePath } = useSiteContent();
  const { fiesta } = payload.sections;

  return (
    <section className="cantina-fiesta relative overflow-hidden py-20 md:py-28">
      <div className="cantina-fiesta-bg absolute inset-0" />
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2 md:px-10">
        <Reveal>
          <p
            data-wb-slot="fiesta.eyebrow"
            className="text-[11px] font-bold uppercase tracking-[0.22em] text-background/80"
          >
            {fiesta.eyebrow}
          </p>
          <h2
            data-wb-slot="fiesta.title"
            className="mt-4 font-serif text-4xl font-bold uppercase leading-[0.95] text-background md:text-6xl"
          >
            {fiesta.title}
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p
            data-wb-slot="fiesta.body"
            className="text-base leading-relaxed text-background/85 md:text-lg"
          >
            {fiesta.body}
          </p>
          <Link
            href={withBasePath(basePath, fiesta.cta.href)}
            data-wb-slot="fiesta.cta"
            className="mt-8 inline-flex cursor-pointer bg-background px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary transition-colors duration-200 hover:bg-background/90"
          >
            {fiesta.cta.label}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
