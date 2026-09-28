"use client";

import { useSiteContent } from "../lib/site-content";
import { Reveal } from "./Reveal";

export function SalsaBar() {
  const { payload } = useSiteContent();
  const { salsaBar } = payload.sections;
  const stepColors = [
    "bg-primary text-background",
    "bg-secondary text-background",
    "bg-ink text-background",
  ];

  return (
    <section className="cantina-salsa-band py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal>
          <div className="max-w-2xl">
            <p data-wb-slot="salsaBar.eyebrow" className="cantina-eyebrow">
              {salsaBar.eyebrow}
            </p>
            <h2
              data-wb-slot="salsaBar.title"
              className="mt-3 font-serif text-4xl font-bold uppercase leading-tight text-primary md:text-5xl"
            >
              {salsaBar.title}
            </h2>
            {salsaBar.body ? (
              <p
                data-wb-slot="salsaBar.body"
                className="mt-5 text-base leading-relaxed text-muted"
              >
                {salsaBar.body}
              </p>
            ) : null}
          </div>
        </Reveal>

        <ol
          data-wb-slot="salsaBar.steps"
          className="mt-14 grid gap-4 md:grid-cols-3 md:gap-6"
        >
          {salsaBar.steps.map((step, i) => (
            <li key={step.id}>
              <Reveal delay={i * 90}>
                <div
                  className={`cantina-step-card h-full p-8 ${stepColors[i % stepColors.length]}`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">
                    Paso {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-serif text-2xl font-bold uppercase tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed opacity-90">
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
