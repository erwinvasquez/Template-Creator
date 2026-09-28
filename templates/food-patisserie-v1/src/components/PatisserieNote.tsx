"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function PatisserieNote() {
  const { payload, basePath } = useSiteContent();
  const { atelierNote } = payload.sections;

  return (
    <section className="px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="patisserie-note-card rounded-[2rem] border border-border bg-background p-10 text-center shadow-[0_20px_50px_-20px_rgba(120,53,15,0.15)] md:p-14">
            <p
              data-wb-slot="atelierNote.eyebrow"
              className="patisserie-eyebrow"
            >
              {atelierNote.eyebrow}
            </p>
            <h2
              data-wb-slot="atelierNote.title"
              className="mt-4 font-serif text-3xl leading-tight text-balance text-primary md:text-4xl"
            >
              {atelierNote.title}
            </h2>
            <p
              data-wb-slot="atelierNote.body"
              className="mt-5 text-base leading-relaxed text-muted"
            >
              {atelierNote.body}
            </p>
            <Link
              href={withBasePath(basePath, atelierNote.cta.href)}
              data-wb-slot="atelierNote.cta"
              className="mt-8 inline-flex cursor-pointer rounded-full bg-primary px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-colors duration-200 hover:bg-primary/90"
            >
              {atelierNote.cta.label}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
