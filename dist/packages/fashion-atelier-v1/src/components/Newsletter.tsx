"use client";

import { FormEvent, useState } from "react";
import { useSiteContent } from "../lib/site-content";
import { Reveal } from "./Reveal";

export function Newsletter() {
  const { payload } = useSiteContent();
  const newsletter = payload.sections.newsletter;
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  }

  return (
    <section className="border-t border-border bg-background py-20 md:py-24">
      <div className="mx-auto max-w-xl px-6 text-center md:px-8">
        <Reveal>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta">
            {newsletter.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-wide md:text-4xl">
            {newsletter.title}
          </h2>
          <p className="mt-3 text-sm text-muted">{newsletter.subtitle}</p>

          {done ? (
            <p className="mt-8 text-sm font-medium text-primary">
              {newsletter.successMessage ?? "Gracias."}
            </p>
          ) : (
            <form
              onSubmit={onSubmit}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Correo electrónico
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={newsletter.placeholder ?? ""}
                className="flex-1 border border-border bg-white px-4 py-3.5 text-sm outline-none transition-colors duration-200 focus:border-primary"
              />
              <button
                type="submit"
                className="cursor-pointer bg-primary px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:bg-secondary"
              >
                {newsletter.submitLabel ?? "Enviar"}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
