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
      className="patisserie-hero relative flex h-[100svh] min-h-[640px] w-full flex-col items-center justify-center overflow-hidden bg-background px-6 pt-24 pb-12 md:px-10 md:pt-28"
    >
      <p className="patisserie-wordmark animate-fade-up text-center text-lg text-secondary md:text-xl">
        {wordmark}
      </p>

      <div className="patisserie-hero-frame relative mt-8 h-[38svh] min-h-[220px] w-full max-w-3xl animate-fade-up overflow-hidden rounded-[2rem] shadow-[0_24px_60px_-12px_rgba(120,53,15,0.25)] [animation-delay:80ms] md:mt-10 md:h-[42svh] md:rounded-[2.5rem]">
        <HeroCarouselMedia

          hero={hero}

          media={payload.media}

          className="object-cover"

          sizes="(max-width: 768px) 100vw, 768px"

        />
</div>

      <div className="mt-10 max-w-2xl text-center animate-fade-up [animation-delay:160ms] md:mt-12">
        <h1
          data-wb-slot="hero.headline"
          className="font-serif text-3xl leading-tight text-balance text-primary md:text-5xl lg:text-6xl"
        >
          {hero.headline}
        </h1>
        <p
          data-wb-slot="hero.subheadline"
          className="mt-5 text-base leading-relaxed text-muted md:text-lg"
        >
          {hero.subheadline}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={withBasePath(basePath, hero.ctaPrimary.href)}
            data-wb-slot="hero.ctaPrimary"
            className="cursor-pointer rounded-full bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-colors duration-200 hover:bg-primary/90"
          >
            {hero.ctaPrimary.label}
          </Link>
          {hero.ctaSecondary ? (
            <Link
              href={withBasePath(basePath, hero.ctaSecondary.href)}
              data-wb-slot="hero.ctaSecondary"
              className="cursor-pointer rounded-full border border-primary/30 bg-surface/60 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors duration-200 hover:bg-surface"
            >
              {hero.ctaSecondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
