"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { resolveMediaUrl, withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function CraftBand() {
  const { payload, basePath } = useSiteContent();
  const craft = payload.sections.craft;

  return (
    <section className="grid md:grid-cols-2">
      <div className="relative aspect-[4/5] md:aspect-auto">
        <Image
          src={resolveMediaUrl(craft.image, payload.media)}
          alt={craft.image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="flex items-center bg-surface px-6 py-16 md:px-16 md:py-0">
        <Reveal>
          <div className="max-w-md">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta">
              {craft.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-4xl tracking-wide text-balance md:text-5xl">
              {craft.title}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              {craft.body}
            </p>
            {craft.cta && (
              <Link
                href={withBasePath(basePath, craft.cta.href)}
                className="mt-8 inline-flex cursor-pointer border border-primary px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors duration-200 hover:bg-primary hover:text-white"
              >
                {craft.cta.label}
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
