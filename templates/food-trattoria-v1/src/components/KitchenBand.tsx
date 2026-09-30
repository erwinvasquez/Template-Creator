"use client";

import { useSiteContent } from "../lib/site-content";
import { Reveal } from "./Reveal";

export function KitchenBand() {
  const { payload } = useSiteContent();
  const { kitchen } = payload.sections;

  return (
    <section className="border-y border-border bg-surface/60 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p data-wb-slot="kitchen.eyebrow" className="trattoria-eyebrow">
              {kitchen.eyebrow}
            </p>
            <h2
              data-wb-slot="kitchen.title"
              className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
            >
              {kitchen.title}
            </h2>
            {kitchen.body ? (
              <p
                data-wb-slot="kitchen.body"
                className="mt-5 text-base leading-relaxed text-muted"
              >
                {kitchen.body}
              </p>
            ) : null}
          </div>
        </Reveal>

        <ol
          data-wb-slot="kitchen.steps"
          className="trattoria-timeline relative mt-16 grid gap-10 md:grid-cols-3 md:gap-6"
        >
          {kitchen.steps.map((step, i) => (
            <li key={step.id} className="relative">
              <Reveal delay={i * 90}>
                <div className="text-center md:px-4">
                  <span
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-secondary bg-background font-serif text-lg text-secondary"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 font-serif text-xl text-primary md:text-2xl">
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
