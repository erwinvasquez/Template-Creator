"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { withBasePath } from "../content/resolve";
import { HeroCarouselMedia } from "../lib/hero-carousel";

export function Hero() {
  const { payload, basePath } = useSiteContent();
  const hero = payload.sections.hero;

  return (
    <section
      data-storefront-home-hero=""
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden"
    >
      <HeroCarouselMedia

        hero={hero}

        media={payload.media}

        className="animate-soft-zoom object-cover"

        sizes="100vw"

      />
<div className="pointer-events-none z-[1] absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/10" />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-14 md:px-10 md:pb-20">
        <p
          data-wb-slot="hero.headline"
          className="animate-fade-up font-serif text-6xl tracking-[0.16em] text-white md:text-8xl lg:text-9xl"
        >
          {hero.headline}
        </p>
        <p
          data-wb-slot="hero.subheadline"
          className="mt-5 max-w-md animate-fade-up text-balance text-sm font-light leading-relaxed text-white/85 md:text-base [animation-delay:120ms]"
        >
          {hero.subheadline}
        </p>
        <div className="mt-8 animate-fade-up [animation-delay:220ms]">
          <Link
            href={withBasePath(basePath, hero.ctaPrimary.href)}
            data-wb-slot="hero.ctaPrimary"
            className="inline-flex cursor-pointer bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-background transition-colors duration-200 hover:bg-primary/90"
          >
            {hero.ctaPrimary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
