"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { resolveMediaUrl, withBasePath } from "../content/resolve";

export function Hero() {
  const { payload, basePath } = useSiteContent();
  const hero = payload.sections.hero;

  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <Image
        src={resolveMediaUrl(hero.image, payload.media)}
        alt={hero.image.alt}
        fill
        priority
        data-wb-slot="hero.image"
        className="object-cover object-[center_22%] animate-ken-burns"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/25 to-primary/10" />

      <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-16 text-center md:pb-24">
        <p
          data-wb-slot="hero.headline"
          className="animate-fade-up font-serif text-5xl font-normal italic leading-[1.05] tracking-wide text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.35)] md:text-7xl lg:text-8xl"
        >
          {hero.headline}
        </p>
        <h1
          data-wb-slot="hero.subheadline"
          className="mt-5 max-w-xl animate-fade-up text-balance text-base font-light leading-relaxed text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)] md:text-lg [animation-delay:120ms]"
        >
          {hero.subheadline}
        </h1>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-up [animation-delay:220ms]">
          <Link
            href={withBasePath(basePath, hero.ctaPrimary.href)}
            data-wb-slot="hero.ctaPrimary"
            className="cursor-pointer bg-background px-9 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-primary shadow-[0_10px_36px_rgba(0,0,0,0.35)] transition-colors duration-200 hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            {hero.ctaPrimary.label}
          </Link>
          {hero.ctaSecondary && (
            <Link
              href={withBasePath(basePath, hero.ctaSecondary.href)}
              data-wb-slot="hero.ctaSecondary"
              className="cursor-pointer border border-white/70 bg-white/5 px-9 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-[2px] transition-colors duration-200 hover:border-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {hero.ctaSecondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
