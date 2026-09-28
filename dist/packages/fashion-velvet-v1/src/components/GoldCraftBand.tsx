"use client";

import { useSiteContent } from "../lib/site-content";
import { Reveal } from "./Reveal";

export function GoldCraftBand() {
  const { payload } = useSiteContent();
  const { goldCraft } = payload.sections;

  return (
    <section className="velvet-band-ink py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <p data-wb-slot="goldCraft.eyebrow" className="velvet-eyebrow">
                {goldCraft.eyebrow}
              </p>
              <h2
                data-wb-slot="goldCraft.title"
                className="mt-4 font-serif text-4xl leading-tight text-balance text-background md:text-5xl"
              >
                {goldCraft.title}
              </h2>
              {goldCraft.body ? (
                <p
                  data-wb-slot="goldCraft.body"
                  className="mt-6 max-w-md text-sm leading-relaxed text-background/68"
                >
                  {goldCraft.body}
                </p>
              ) : null}
              <div className="velvet-gold-rule mt-8 opacity-90" />
            </div>
          </Reveal>

          <ol
            data-wb-slot="goldCraft.steps"
            className="relative space-y-0 border-l border-secondary/35 pl-8 md:pl-10"
          >
            {goldCraft.steps.map((step, i) => (
              <li key={step.id} className="relative pb-12 last:pb-0">
                <span className="absolute -left-[2.125rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-secondary bg-ink md:-left-[2.375rem]">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                </span>
                <Reveal delay={i * 90}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary">
                    Paso {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl text-background">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-background/65">
                    {step.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
