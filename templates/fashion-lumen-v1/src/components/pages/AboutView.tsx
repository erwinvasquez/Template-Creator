"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../../lib/site-content";
import { resolveMediaUrl, withBasePath } from "../../content/resolve";
import { Reveal } from "../Reveal";

export function AboutView() {
  const { payload, basePath } = useSiteContent();
  const about = payload.sections.about;

  return (
    <div className="pb-24 pt-28 md:pt-32">
      <section className="mx-auto max-w-7xl px-6 md:px-8">
        <Reveal>
          <p
            data-wb-slot="about.intro.eyebrow"
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta"
          >
            {about.intro.eyebrow}
          </p>
          <h1
            data-wb-slot="about.intro.title"
            className="mt-3 max-w-3xl font-serif text-4xl tracking-wide text-balance md:text-6xl"
          >
            {about.intro.title}
          </h1>
          <p
            data-wb-slot="about.intro.body"
            className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg"
          >
            {about.intro.body}
          </p>
        </Reveal>
      </section>

      <section className="relative mt-16 min-h-[55vh] overflow-hidden md:mt-24">
        <Image
          src={resolveMediaUrl(about.bannerImage, payload.media)}
          alt={about.bannerImage.alt}
          fill
          data-wb-slot="about.bannerImage"
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-primary/35" />
      </section>

      <section
        id="sostenibilidad"
        className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:gap-20 md:px-8 md:py-28"
        data-wb-slot="about.blocks"
      >
        {about.blocks.map((block, i) => (
          <Reveal key={block.id} delay={i * 120}>
            <h2 className="font-serif text-3xl tracking-wide md:text-4xl">
              {block.title}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              {block.body}
            </p>
          </Reveal>
        ))}
      </section>

      <section
        id="ateliers"
        className="border-y border-border bg-surface/50 py-20 md:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <Reveal>
            <p
              data-wb-slot="about.locations.eyebrow"
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta"
            >
              {about.locations.eyebrow}
            </p>
            <h2
              data-wb-slot="about.locations.title"
              className="mt-3 font-serif text-3xl tracking-wide md:text-4xl"
            >
              {about.locations.title}
            </h2>
          </Reveal>
          <div
            className="mt-12 grid gap-8 md:grid-cols-3"
            data-wb-slot="about.locations.items"
          >
            {about.locations.items.map((store, i) => (
              <Reveal key={store.city} delay={i * 100}>
                <div>
                  <h3 className="font-serif text-2xl tracking-wide">
                    {store.city}
                  </h3>
                  <p className="mt-3 text-sm text-muted">{store.address}</p>
                  <p className="mt-1 text-sm text-muted">{store.hours}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center md:px-8 md:py-28">
        <Reveal>
          <h2
            data-wb-slot="about.closing.title"
            className="font-serif text-3xl tracking-wide md:text-4xl"
          >
            {about.closing.title}
          </h2>
          <p
            data-wb-slot="about.closing.body"
            className="mx-auto mt-4 max-w-md text-sm text-muted"
          >
            {about.closing.body}
          </p>
          <Link
            href={withBasePath(basePath, about.closing.cta.href)}
            data-wb-slot="about.closing.cta"
            className="mt-8 inline-flex cursor-pointer bg-cta px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-cta-hover"
          >
            {about.closing.cta.label}
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
