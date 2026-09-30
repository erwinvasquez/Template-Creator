"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { resolveMediaUrl, withBasePath } from "../content/resolve";

export function Hero() {
  const { payload, basePath } = useSiteContent();
  const hero = payload.sections.hero;
  const wordmark = payload.brand.displayName || payload.brand.name;

  return (
    <section className="trattoria-hero-split relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-background">
      <div className="trattoria-hero-panel relative z-10 flex flex-col justify-between px-6 pb-12 pt-28 md:px-10 md:pb-16 md:pt-32 lg:px-14">
        <p className="trattoria-wordmark animate-fade-up text-xl text-primary md:text-2xl">
          {wordmark}
        </p>

        <div className="mt-auto max-w-lg">
          <h1
            data-wb-slot="hero.headline"
            className="animate-fade-up font-serif text-4xl leading-[1.08] text-balance text-primary md:text-5xl lg:text-6xl [animation-delay:80ms]"
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
              className="cursor-pointer rounded-full bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-background transition-colors duration-200 hover:bg-primary/90"
            >
              {hero.ctaPrimary.label}
            </Link>
            {hero.ctaSecondary ? (
              <Link
                href={withBasePath(basePath, hero.ctaSecondary.href)}
                data-wb-slot="hero.ctaSecondary"
                className="cursor-pointer rounded-full border border-primary/40 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors duration-200 hover:border-primary hover:bg-primary/5"
              >
                {hero.ctaSecondary.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative min-h-[42svh] lg:min-h-0">
        <div className="trattoria-hero-accent absolute inset-y-0 left-0 z-10 hidden w-1 lg:block" />
        <Image
          src={resolveMediaUrl(hero.image, payload.media)}
          alt={hero.image.alt}
          fill
          priority
          data-wb-slot="hero.image"
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
        <div className="trattoria-hero-scrim absolute inset-0 lg:hidden" />
      </div>
    </section>
  );
}
