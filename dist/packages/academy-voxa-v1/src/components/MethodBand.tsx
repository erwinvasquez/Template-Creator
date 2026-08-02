"use client";

import { useSiteContent } from "../lib/site-content";
import { Reveal } from "./Reveal";

export function MethodBand() {
  const { payload } = useSiteContent();
  const { method } = payload.sections;

  return (
    <section
      id="method"
      className="border-y border-border bg-surface py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="max-w-2xl">
            <p
              data-wb-slot="method.eyebrow"
              className="voxa-rule text-[11px] font-semibold uppercase tracking-[0.2em] text-cta"
            >
              {method.eyebrow}
            </p>
            <h2
              data-wb-slot="method.title"
              className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
            >
              {method.title}
            </h2>
            {method.body && (
              <p
                data-wb-slot="method.body"
                className="mt-5 text-base leading-relaxed text-muted"
              >
                {method.body}
              </p>
            )}
          </div>
        </Reveal>

        <ol
          data-wb-slot="method.steps"
          className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4"
        >
          {method.steps.map((step, i) => (
            <li key={step.id} className="bg-white">
              <Reveal delay={i * 90}>
                <div className="flex h-full flex-col p-7 md:p-8">
                  <span className="font-serif text-3xl text-cta">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-serif text-xl leading-tight text-primary">
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
