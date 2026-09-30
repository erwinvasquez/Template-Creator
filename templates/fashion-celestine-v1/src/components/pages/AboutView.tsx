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
    <div className="pb-24">
      <section className="relative overflow-hidden bg-ink pt-28 md:pt-36">
        <div className="relative mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
          <Reveal>
            <p
              data-wb-slot="about.intro.eyebrow"
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary"
            >
              {about.intro.eyebrow}
            </p>
            <h1
              data-wb-slot="about.intro.title"
              className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-balance text-white md:text-6xl"
            >
              {about.intro.title}
            </h1>
            <p
              data-wb-slot="about.intro.body"
              className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
            >
              {about.intro.body}
            </p>
          </Reveal>
        </div>
        <div className="relative mx-auto aspect-[21/9] max-w-7xl overflow-hidden md:rounded-t-3xl">
          <Image
            src={resolveMediaUrl(about.bannerImage, payload.media)}
            alt={about.bannerImage.alt}
            fill
            data-wb-slot="about.bannerImage"
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28"
        data-wb-slot="about.blocks"
      >
        <div className="grid gap-8 md:grid-cols-3">
          {about.blocks.map((block, i) => (
            <Reveal key={block.id} delay={i * 80}>
              <div className="rounded-2xl border border-border bg-white p-7">
                <h2 className="font-serif text-2xl text-primary">{block.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {block.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section
        id="prueba"
        className="border-y border-border bg-surface py-20 md:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <p
              data-wb-slot="about.locations.eyebrow"
              className="celestine-eyebrow"
            >
              {about.locations.eyebrow}
            </p>
            <h2
              data-wb-slot="about.locations.title"
              className="mt-3 font-serif text-4xl text-primary md:text-5xl"
            >
              {about.locations.title}
            </h2>
          </Reveal>
          <ul
            className="mt-10 grid gap-6 md:grid-cols-2"
            data-wb-slot="about.locations.items"
          >
            {about.locations.items.map((loc) => (
              <li
                key={loc.city}
                className="rounded-2xl border border-border bg-white p-7"
              >
                <h3 className="font-serif text-2xl text-primary">{loc.city}</h3>
                <p className="mt-3 text-sm text-muted">{loc.address}</p>
                <p className="mt-2 text-sm text-secondary">{loc.hours}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:px-10 md:py-28">
        <Reveal>
          <h2
            data-wb-slot="about.closing.title"
            className="font-serif text-4xl text-primary md:text-5xl"
          >
            {about.closing.title}
          </h2>
          <p
            data-wb-slot="about.closing.body"
            className="mt-5 text-base leading-relaxed text-muted"
          >
            {about.closing.body}
          </p>
          <Link
            href={withBasePath(basePath, about.closing.cta.href)}
            data-wb-slot="about.closing.cta"
            className="mt-10 inline-flex cursor-pointer rounded-full bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-background transition-colors duration-200 hover:bg-primary/90"
          >
            {about.closing.cta.label}
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
