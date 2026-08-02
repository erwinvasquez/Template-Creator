"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function AtelierNote() {
  const { payload, basePath } = useSiteContent();
  const { note } = payload.sections;

  return (
    <section className="bg-ink py-20 text-white md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
        <Reveal>
          <p
            data-wb-slot="note.eyebrow"
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cta"
          >
            {note.eyebrow}
          </p>
          <h2
            data-wb-slot="note.title"
            className="mt-4 font-serif text-4xl leading-tight text-balance md:text-5xl"
          >
            {note.title}
          </h2>
          <p
            data-wb-slot="note.body"
            className="mt-6 text-base leading-relaxed text-white/70"
          >
            {note.body}
          </p>
          <Link
            href={withBasePath(basePath, note.cta.href)}
            className="mt-10 inline-flex cursor-pointer rounded-full bg-cta px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-cta-hover"
          >
            {note.cta.label}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
