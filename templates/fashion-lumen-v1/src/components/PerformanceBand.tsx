"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { resolveMediaUrl, withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function PerformanceBand() {
  const { payload, basePath } = useSiteContent();
  const performance = payload.sections.performance;

  return (
    <section className="bg-surface">
      <div className="grid min-h-[70vh] lg:grid-cols-12">
        <figure className="relative min-h-[48vh] lg:col-span-7 lg:min-h-[78vh]">
          <Image
            src={resolveMediaUrl(performance.image, payload.media)}
            alt={performance.image.alt}
            fill
            data-wb-slot="performance.image"
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </figure>

        <div className="relative flex items-center lg:col-span-5">
          {/* Acento editorial: línea oro vertical en desktop */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-12 left-0 hidden w-1 bg-cta lg:block"
          />

          <Reveal className="w-full px-6 py-14 md:px-10 md:py-20 lg:px-12 xl:px-16">
            <p
              data-wb-slot="performance.eyebrow"
              className="text-[11px] font-bold uppercase tracking-[0.24em] text-cta"
            >
              {performance.eyebrow}
            </p>
            <h2
              data-wb-slot="performance.title"
              className="mt-4 font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight text-balance text-primary md:text-5xl"
            >
              {performance.title}
            </h2>
            <p
              data-wb-slot="performance.body"
              className="mt-5 max-w-md text-sm leading-relaxed text-muted md:text-base"
            >
              {performance.body}
            </p>
            {performance.cta && (
              <Link
                href={withBasePath(basePath, performance.cta.href)}
                data-wb-slot="performance.cta"
                className="mt-9 inline-flex cursor-pointer bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-colors duration-200 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                {performance.cta.label}
              </Link>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
