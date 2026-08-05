"use client";

import { useSiteContent } from "../lib/site-content";
import { Reveal } from "./Reveal";

export function CraftBand() {
  const { payload } = useSiteContent();
  const { craft } = payload.sections;

  return (
    <section className="border-y border-border bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="max-w-2xl">
            <p data-wb-slot="craft.eyebrow" className="celestine-eyebrow">
              {craft.eyebrow}
            </p>
            <h2
              data-wb-slot="craft.title"
              className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
            >
              {craft.title}
            </h2>
            {craft.body ? (
              <p
                data-wb-slot="craft.body"
                className="mt-5 text-base leading-relaxed text-muted"
              >
                {craft.body}
              </p>
            ) : null}
          </div>
        </Reveal>

        <ol
          data-wb-slot="craft.steps"
          className="mt-14 grid gap-6 md:grid-cols-3"
        >
          {craft.steps.map((step, i) => (
            <li key={step.id}>
              <Reveal delay={i * 90}>
                <div className="h-full rounded-2xl border border-border bg-white p-7 md:p-8">
                  <span className="font-serif text-3xl text-cta">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-serif text-2xl text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
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
