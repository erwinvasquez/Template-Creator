"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function SalonNote() {
  const { payload, basePath } = useSiteContent();
  const { salon } = payload.sections;

  return (
    <section className="border-y border-border bg-background py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-2 md:items-center md:gap-16 md:px-10">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden bg-ink">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(202,138,4,0.28),transparent_55%),linear-gradient(160deg,#1c1917,#0c0a09)]" />
            <div className="absolute inset-8 border border-secondary/30" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <p className="velvet-wordmark text-2xl text-white/90">Salon</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-secondary">
                Cita privada
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <p data-wb-slot="salon.eyebrow" className="velvet-eyebrow">
            {salon.eyebrow}
          </p>
          <h2
            data-wb-slot="salon.title"
            className="mt-4 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
          >
            {salon.title}
          </h2>
          <p
            data-wb-slot="salon.body"
            className="mt-6 text-sm leading-relaxed text-muted md:text-base"
          >
            {salon.body}
          </p>
          <Link
            href={withBasePath(basePath, salon.cta.href)}
            data-wb-slot="salon.cta"
            className="mt-10 inline-flex cursor-pointer border border-primary px-8 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary transition-colors duration-200 hover:border-secondary hover:bg-secondary hover:text-primary"
          >
            {salon.cta.label}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
