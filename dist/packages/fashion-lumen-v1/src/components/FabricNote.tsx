"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { resolveMediaUrl, withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function FabricNote() {
  const { payload, basePath } = useSiteContent();
  const fabricNote = payload.sections.fabricNote;

  return (
    <section className="bg-background">
      <div className="grid min-h-[70vh] lg:grid-cols-12">
        <figure className="relative min-h-[48vh] lg:col-span-7 lg:min-h-[78vh]">
          <Image
            src={resolveMediaUrl(fabricNote.image, payload.media)}
            alt={fabricNote.image.alt}
            fill
            data-wb-slot="fabricNote.image"
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </figure>

        <div className="relative flex items-center lg:col-span-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-12 left-0 hidden w-px bg-secondary/40 lg:block"
          />

          <Reveal className="w-full px-6 py-14 md:px-10 md:py-20 lg:px-12 xl:px-16">
            <p
              data-wb-slot="fabricNote.eyebrow"
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-secondary"
            >
              {fabricNote.eyebrow}
            </p>
            <h2
              data-wb-slot="fabricNote.title"
              className="mt-4 font-serif text-4xl font-normal leading-[1.1] text-balance md:text-5xl"
            >
              {fabricNote.title}
            </h2>
            <p
              data-wb-slot="fabricNote.body"
              className="mt-5 max-w-md text-sm font-light leading-relaxed text-muted md:text-base"
            >
              {fabricNote.body}
            </p>
            {fabricNote.cta && (
              <Link
                href={withBasePath(basePath, fabricNote.cta.href)}
                data-wb-slot="fabricNote.cta"
                className="mt-9 inline-flex cursor-pointer border border-primary px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-primary transition-colors duration-200 hover:bg-primary hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {fabricNote.cta.label}
              </Link>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
