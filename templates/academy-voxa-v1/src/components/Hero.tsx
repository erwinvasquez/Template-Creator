"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { withBasePath } from "../content/resolve";
import { HeroCarouselMedia } from "../lib/hero-carousel";

export function Hero() {
  const { payload, basePath } = useSiteContent();
  const hero = payload.sections.hero;
  const wordmark = payload.brand.displayName || payload.brand.name;

  return (
    <section
      data-storefront-home-hero=""
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink"
    >
      <HeroCarouselMedia

        hero={hero}

        media={payload.media}

        className="animate-soft-zoom object-cover opacity-70"

        sizes="100vw"

      />
<div className="pointer-events-none z-[1] voxa-hero-scrim absolute inset-0" />
      <div className="voxa-hero-aura pointer-events-none z-[1] absolute inset-0" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-16 pt-32 md:px-10 md:pb-24">
        <p className="voxa-wordmark animate-fade-up text-5xl text-white/95 md:text-7xl lg:text-8xl">
          {wordmark}
        </p>

        <h1
          data-wb-slot="hero.headline"
          className="mt-8 max-w-3xl animate-fade-up font-serif text-3xl leading-[1.15] text-balance text-white md:text-5xl [animation-delay:100ms]"
        >
          {hero.headline}
        </h1>

        <p
          data-wb-slot="hero.subheadline"
          className="mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-white/75 [animation-delay:180ms]"
        >
          {hero.subheadline}
        </p>

        <div className="mt-9 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:260ms]">
          <Link
            href={withBasePath(basePath, hero.ctaPrimary.href)}
            data-wb-slot="hero.ctaPrimary"
            className="inline-flex cursor-pointer bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-background transition-colors duration-200 hover:bg-primary/90"
          >
            {hero.ctaPrimary.label}
          </Link>
          {hero.ctaSecondary && (
            <Link
              href={withBasePath(basePath, hero.ctaSecondary.href)}
              data-wb-slot="hero.ctaSecondary"
              className="inline-flex cursor-pointer border border-white/35 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:border-white hover:bg-white/10"
            >
              {hero.ctaSecondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
