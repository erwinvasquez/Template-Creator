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
      className="nova-hero-split relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-background"
    >
      <div className="nova-hero-panel relative z-10 flex flex-col justify-between px-6 pb-12 pt-28 md:px-10 md:pb-16 md:pt-32 lg:px-14">
        <p className="nova-wordmark animate-fade-up text-2xl text-primary md:text-3xl">
          {wordmark}
        </p>

        <div className="mt-auto max-w-xl">
          <h1
            data-wb-slot="hero.headline"
            className="animate-fade-up font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-balance text-text md:text-6xl lg:text-7xl [animation-delay:80ms]"
          >
            {hero.headline}
          </h1>

          <p
            data-wb-slot="hero.subheadline"
            className="mt-5 max-w-md animate-fade-up text-base leading-relaxed text-muted md:text-lg [animation-delay:160ms]"
          >
            {hero.subheadline}
          </p>

          <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:240ms]">
            <Link
              href={withBasePath(basePath, hero.ctaPrimary.href)}
              data-wb-slot="hero.ctaPrimary"
              className="cursor-pointer bg-primary px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-background transition-colors duration-200 hover:bg-primary/90"
            >
              {hero.ctaPrimary.label}
            </Link>
            {hero.ctaSecondary ? (
              <Link
                href={withBasePath(basePath, hero.ctaSecondary.href)}
                data-wb-slot="hero.ctaSecondary"
                className="cursor-pointer border-2 border-secondary px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary transition-colors duration-200 hover:bg-secondary hover:text-background"
              >
                {hero.ctaSecondary.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative min-h-[42svh] lg:min-h-0">
        <div className="nova-hero-accent absolute inset-y-0 left-0 z-10 hidden w-3 lg:block" />
        <HeroCarouselMedia

          hero={hero}

          media={payload.media}

          className="animate-slide-in-right object-cover"

          sizes="(max-width: 1024px) 100vw, 55vw"

        />
<div className="pointer-events-none z-[1] nova-hero-scrim absolute inset-0 lg:hidden" />
      </div>
    </section>
  );
}
