"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { withBasePath } from "../content/resolve";
import { Reveal } from "./Reveal";

export function AppointmentBand() {
  const { payload, basePath } = useSiteContent();
  const appointment = payload.sections.appointment;

  return (
    <section className="bg-ink py-24 text-white md:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center md:px-10">
        <Reveal>
          <p
            data-wb-slot="appointment.eyebrow"
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-secondary"
          >
            {appointment.eyebrow}
          </p>
          <h2
            data-wb-slot="appointment.title"
            className="mt-4 font-serif text-4xl tracking-wide text-balance md:text-5xl"
          >
            {appointment.title}
          </h2>
          <p
            data-wb-slot="appointment.body"
            className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/70 md:text-base"
          >
            {appointment.body}
          </p>
          <Link
            href={withBasePath(basePath, appointment.cta.href)}
            data-wb-slot="appointment.cta"
            className="mt-9 inline-flex cursor-pointer border border-white/40 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:border-cta hover:bg-primary"
          >
            {appointment.cta.label}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
