"use client";

import { useSiteContent } from "../lib/site-content";
import { Reveal } from "./Reveal";

export function SeasonalBand() {
  const { payload } = useSiteContent();
  const { seasonal } = payload.sections;

  return (
    <section className="border-y border-border bg-surface/40 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="max-w-2xl">
            <p data-wb-slot="seasonal.eyebrow" className="patisserie-eyebrow">
              {seasonal.eyebrow}
            </p>
            <h2
              data-wb-slot="seasonal.title"
              className="mt-3 font-serif text-3xl leading-tight text-balance text-primary md:text-4xl"
            >
              {seasonal.title}
            </h2>
            {seasonal.body ? (
              <p
                data-wb-slot="seasonal.body"
                className="mt-4 text-base leading-relaxed text-muted"
              >
                {seasonal.body}
              </p>
            ) : null}
          </div>
        </Reveal>

        <ol
          data-wb-slot="seasonal.steps"
          className="category-scroll mt-10 flex gap-4 overflow-x-auto pb-2 md:gap-5"
        >
          {seasonal.steps.map((step, i) => (
            <li key={step.id} className="shrink-0">
              <Reveal delay={i * 80}>
                <div className="patisserie-step-pill w-[min(85vw,280px)] rounded-3xl border border-border bg-background p-6 shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-serif text-xl text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
