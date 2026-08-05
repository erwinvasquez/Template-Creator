"use client";

import { FormEvent, useState } from "react";
import { useSiteContent } from "../lib/site-content";
import { Reveal } from "./Reveal";

export function CommunityStrip() {
  const { payload } = useSiteContent();
  const community = payload.sections.community;
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  }

  return (
    <section className="border-t border-border bg-surface py-20 md:py-24">
      <div className="mx-auto max-w-xl px-6 text-center md:px-8">
        <Reveal>
          <p
            data-wb-slot="community.eyebrow"
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-cta"
          >
            {community.eyebrow}
          </p>
          <h2
            data-wb-slot="community.title"
            className="mt-3 font-serif text-3xl tracking-wide text-primary md:text-4xl"
          >
            {community.title}
          </h2>
          <p data-wb-slot="community.subtitle" className="mt-3 text-sm text-muted">
            {community.subtitle}
          </p>

          {done ? (
            <p
              data-wb-slot="community.successMessage"
              className="mt-8 text-sm font-medium text-primary"
            >
              {community.successMessage}
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
                data-wb-slot="community.placeholder"
                placeholder={community.placeholder}
                className="flex-1 border border-border bg-background px-4 py-3.5 text-sm text-primary placeholder:text-muted outline-none transition-colors duration-200 focus:border-primary"
              />
              <button
                type="submit"
                data-wb-slot="community.submitLabel"
                className="cursor-pointer bg-primary px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-background transition-colors duration-200 hover:bg-secondary"
              >
                {community.submitLabel}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
