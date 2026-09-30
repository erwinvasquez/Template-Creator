"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { resolveMediaUrl, withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function EditorialBanner() {
  const { payload, basePath } = useSiteContent();
  const editorial = payload.sections.editorial;

  return (
    <section className="bg-surface">
      <div className="grid min-h-[70vh] lg:grid-cols-12">
        <figure className="relative min-h-[48vh] lg:col-span-7 lg:min-h-[78vh]">
          <Image
            src={resolveMediaUrl(editorial.image, payload.media)}
            alt={editorial.image.alt}
            fill
            data-wb-slot="editorial.image"
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </figure>

        <div className="relative flex items-center lg:col-span-5">
          {/* Acento editorial: línea oro vertical en desktop */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-12 left-0 hidden w-px bg-secondary/40 lg:block"
          />

          <Reveal className="w-full px-6 py-14 md:px-10 md:py-20 lg:px-12 xl:px-16">
            <p
              data-wb-slot="editorial.eyebrow"
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-secondary"
            >
              {editorial.eyebrow}
            </p>
            <h2
              data-wb-slot="editorial.title"
              className="mt-4 font-serif text-4xl leading-[1.15] tracking-wide text-balance text-primary md:text-5xl"
            >
              {editorial.title}
            </h2>
            <p
              data-wb-slot="editorial.body"
              className="mt-5 max-w-md text-sm leading-relaxed text-muted md:text-base"
            >
              {editorial.body}
            </p>
            {editorial.cta && (
              <Link
                href={withBasePath(basePath, editorial.cta.href)}
                data-wb-slot="editorial.cta"
                className="mt-9 inline-flex cursor-pointer bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-colors duration-200 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                {editorial.cta.label}
              </Link>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
