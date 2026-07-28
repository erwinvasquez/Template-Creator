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
        className="object-cover object-[center_20%] animate-ken-burns"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/25 to-primary/20" />

      <div className="relative z-10 flex h-full flex-col items-center justify-end px-6 pb-16 text-center md:pb-24">
        <p className="animate-fade-up font-serif text-5xl tracking-[0.28em] text-white md:text-7xl lg:text-8xl">
          {hero.headline}
        </p>
        <h1 className="mt-5 max-w-xl animate-fade-up text-balance text-base font-light leading-relaxed text-white/90 md:text-lg [animation-delay:120ms]">
          {hero.subheadline}
        </h1>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-up [animation-delay:220ms]">
          <Link
            href={withBasePath(basePath, hero.ctaPrimary.href)}
            className="cursor-pointer bg-cta px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-cta-hover"
          >
            {hero.ctaPrimary.label}
          </Link>
          {hero.ctaSecondary && (
            <Link
              href={withBasePath(basePath, hero.ctaSecondary.href)}
              className="cursor-pointer border border-white/50 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:border-white hover:bg-white/10"
            >
              {hero.ctaSecondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
