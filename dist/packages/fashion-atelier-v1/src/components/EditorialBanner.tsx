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
    <section className="relative min-h-[70vh] overflow-hidden">
      <Image
        src={resolveMediaUrl(editorial.image, payload.media)}
        alt={editorial.image.alt}
        fill
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-primary/45" />
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl items-end px-6 py-16 md:px-8 md:py-24">
        <Reveal>
          <div className="max-w-lg text-white">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta">
              {editorial.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-4xl tracking-wide text-balance md:text-5xl">
              {editorial.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/80 md:text-base">
              {editorial.body}
            </p>
            {editorial.cta && (
              <Link
                href={withBasePath(basePath, editorial.cta.href)}
                className="mt-8 inline-flex cursor-pointer border border-white/50 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:border-white hover:bg-white/10"
              >
                {editorial.cta.label}
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
