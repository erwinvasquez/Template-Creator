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

        className="animate-soft-drift object-cover opacity-70"

        sizes="100vw"

      />
<div className="pointer-events-none z-[1] velvet-hero-scrim absolute inset-0" />
      <div className="velvet-hero-veil pointer-events-none z-[1] absolute inset-0" />

      <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-6 text-center md:px-10">
        <p className="velvet-wordmark animate-fade-up text-3xl text-white/90 md:text-5xl lg:text-6xl">
          {wordmark}
        </p>

        <div className="velvet-gold-rule mx-auto mt-8 animate-fade-up [animation-delay:80ms]" />

        <h1
          data-wb-slot="hero.headline"
          className="mt-8 max-w-3xl animate-fade-up font-serif text-4xl leading-[1.12] text-balance text-white md:text-6xl lg:text-7xl [animation-delay:140ms]"
        >
          {hero.headline}
        </h1>

        <p
          data-wb-slot="hero.subheadline"
          className="mt-6 max-w-xl animate-fade-up text-sm leading-relaxed tracking-wide text-white/72 md:text-base [animation-delay:220ms]"
        >
          {hero.subheadline}
        </p>

        <div className="mt-10 flex animate-fade-up flex-wrap items-center justify-center gap-4 [animation-delay:300ms]">
          <Link
            href={withBasePath(basePath, hero.ctaPrimary.href)}
            data-wb-slot="hero.ctaPrimary"
            className="cursor-pointer rounded-none border border-secondary bg-secondary px-8 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary transition-colors duration-200 hover:bg-secondary/90"
          >
            {hero.ctaPrimary.label}
          </Link>
          {hero.ctaSecondary ? (
            <Link
              href={withBasePath(basePath, hero.ctaSecondary.href)}
              data-wb-slot="hero.ctaSecondary"
              className="cursor-pointer rounded-none border border-white/35 px-8 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition-colors duration-200 hover:border-secondary hover:text-secondary"
            >
              {hero.ctaSecondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
