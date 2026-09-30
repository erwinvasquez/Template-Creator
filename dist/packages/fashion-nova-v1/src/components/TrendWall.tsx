"use client";

import { useSiteContent } from "../lib/site-content";
import { Reveal } from "./Reveal";

export function TrendWall() {
  const { payload } = useSiteContent();
  const { trendWall } = payload.sections;

  return (
    <section className="border-y-2 border-border bg-surface py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-2xl">
              <p data-wb-slot="trendWall.eyebrow" className="nova-eyebrow">
                {trendWall.eyebrow}
              </p>
              <h2
                data-wb-slot="trendWall.title"
                className="mt-4 font-display text-4xl font-extrabold uppercase leading-[0.95] text-balance text-text md:text-5xl"
              >
                {trendWall.title}
              </h2>
              {trendWall.body ? (
                <p
                  data-wb-slot="trendWall.body"
                  className="mt-5 max-w-xl text-base leading-relaxed text-muted"
                >
                  {trendWall.body}
                </p>
              ) : null}
            </div>
            <div
              className="hidden h-24 w-24 bg-primary md:block"
              aria-hidden
            />
          </div>
        </Reveal>

        <ol
          data-wb-slot="trendWall.steps"
          className="nova-trend-zigzag mt-14"
        >
          {trendWall.steps.map((step, i) => (
            <li key={step.id}>
              <Reveal delay={i * 90}>
                <div
                  className={`nova-block h-full p-7 md:p-8 ${
                    i === 1 ? "bg-background" : "bg-white"
                  }`}
                >
                  <span className="font-display text-5xl font-extrabold text-secondary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 font-display text-xl font-bold uppercase text-text">
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
