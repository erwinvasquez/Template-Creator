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
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink">
      <Image
        src={resolveMediaUrl(hero.image, payload.media)}
        alt={hero.image.alt}
        fill
        priority
        data-wb-slot="hero.image"
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="cantina-hero-scrim absolute inset-0" />

      <div className="cantina-hero-block absolute bottom-0 left-0 z-10 max-w-2xl px-6 py-10 md:px-10 md:py-14 lg:max-w-3xl lg:px-14">
        <p className="cantina-wordmark animate-fade-up text-2xl text-background md:text-4xl">
          {wordmark}
        </p>
        <h1
          data-wb-slot="hero.headline"
          className="mt-4 animate-fade-up font-serif text-4xl font-bold uppercase leading-[0.95] tracking-tight text-balance text-background md:text-6xl lg:text-7xl [animation-delay:100ms]"
        >
          {hero.headline}
        </h1>
        <p
          data-wb-slot="hero.subheadline"
          className="mt-5 max-w-md animate-fade-up text-base leading-relaxed text-background/85 [animation-delay:180ms]"
        >
          {hero.subheadline}
        </p>
        <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:260ms]">
          <Link
            href={withBasePath(basePath, hero.ctaPrimary.href)}
            data-wb-slot="hero.ctaPrimary"
            className="cursor-pointer bg-secondary px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-background shadow-lg transition-colors duration-200 hover:bg-secondary/90"
          >
            {hero.ctaPrimary.label}
          </Link>
          {hero.ctaSecondary ? (
            <Link
              href={withBasePath(basePath, hero.ctaSecondary.href)}
              data-wb-slot="hero.ctaSecondary"
              className="cursor-pointer border-2 border-background/80 px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-background transition-colors duration-200 hover:bg-background hover:text-primary"
            >
              {hero.ctaSecondary.label}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="cantina-hero-stripe pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-16 md:block" />
    </section>
  );
}
