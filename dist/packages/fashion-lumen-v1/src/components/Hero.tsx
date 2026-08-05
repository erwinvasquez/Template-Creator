"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { resolveMediaUrl, withBasePath } from "../content/resolve";

export function Hero() {
  const { payload, basePath } = useSiteContent();
  const hero = payload.sections.hero;

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-primary">
      <Image
        src={resolveMediaUrl(hero.image, payload.media)}
        alt={hero.image.alt}
        fill
        priority
        data-wb-slot="hero.image"
        className="object-cover object-center animate-ken-burns"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-primary/20" />

      <div className="relative z-10 flex h-full flex-col items-start justify-end px-6 pb-16 md:px-12 md:pb-24">
        <p
          data-wb-slot="hero.headline"
          className="animate-fade-up font-display text-6xl font-bold uppercase leading-[0.92] tracking-tight text-white md:text-8xl lg:text-9xl"
        >
          {hero.headline}
        </p>
        <h1
          data-wb-slot="hero.subheadline"
          className="mt-5 max-w-lg animate-fade-up text-balance text-base font-medium leading-relaxed text-white/90 md:text-lg [animation-delay:100ms]"
        >
          {hero.subheadline}
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up [animation-delay:180ms]">
          <Link
            href={withBasePath(basePath, hero.ctaPrimary.href)}
            data-wb-slot="hero.ctaPrimary"
            className="cursor-pointer bg-cta px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            {hero.ctaPrimary.label}
          </Link>
          {hero.ctaSecondary && (
            <Link
              href={withBasePath(basePath, hero.ctaSecondary.href)}
              data-wb-slot="hero.ctaSecondary"
              className="cursor-pointer border-2 border-white/80 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors duration-200 hover:border-cta hover:text-cta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {hero.ctaSecondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
