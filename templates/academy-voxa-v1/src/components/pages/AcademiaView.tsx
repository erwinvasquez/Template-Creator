"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../../lib/site-content";
import { resolveMediaUrl, withBasePath } from "../../content/resolve";
import { Reveal } from "../Reveal";

export function AcademiaView() {
  const { payload, basePath } = useSiteContent();
  const about = payload.sections.about;

  return (
    <div className="pb-24 pt-12 md:pt-16">
      <section className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <p className="voxa-rule text-[11px] font-semibold uppercase tracking-[0.2em] text-cta">
            {about.intro.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-balance text-primary md:text-6xl">
            {about.intro.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            {about.intro.body}
          </p>
        </Reveal>
      </section>

      <section className="relative mt-16 min-h-[52vh] overflow-hidden md:mt-24">
        <Image
          src={resolveMediaUrl(about.bannerImage, payload.media)}
          alt={about.bannerImage.alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-primary/35" />
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:gap-20 md:px-10 md:py-28">
        {about.blocks.map((block, i) => (
          <Reveal key={block.id} delay={i * 120}>
            <h2 className="font-serif text-3xl leading-tight text-primary md:text-4xl">
              {block.title}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted md:text-base">
              {block.body}
            </p>
          </Reveal>
        ))}
      </section>

      <section
        id="claustro"
        className="border-y border-border bg-surface py-20 md:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Reveal>
            <p className="voxa-rule text-[11px] font-semibold uppercase tracking-[0.2em] text-cta">
              {about.faculty.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-primary md:text-4xl">
              {about.faculty.title}
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {about.faculty.items.map((person, i) => (
              <Reveal key={person.name} delay={i * 100}>
                <div className="h-full rounded-xl border border-border bg-white p-7">
                  <h3 className="font-serif text-2xl leading-tight text-primary">
                    {person.name}
                  </h3>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cta">
                    {person.role}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {person.focus}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center md:px-10 md:py-28">
        <Reveal>
          <h2 className="font-serif text-3xl leading-tight text-primary md:text-4xl">
            {about.closing.title}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted md:text-base">
            {about.closing.body}
          </p>
          <Link
            href={withBasePath(basePath, about.closing.cta.href)}
            className="mt-8 inline-flex cursor-pointer bg-cta px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-cta-hover"
          >
            {about.closing.cta.label}
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
