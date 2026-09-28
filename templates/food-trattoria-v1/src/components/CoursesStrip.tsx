"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import {
  SHOP_PATH,
  getCoursesCollections,
  withBasePath,
} from "../content/resolve";
import { Reveal } from "./Reveal";

export function CoursesStrip() {
  const { payload, basePath } = useSiteContent();
  const { courses } = payload.sections;
  const items = getCoursesCollections(payload);
  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
      <Reveal>
        <div className="max-w-xl border-l-4 border-secondary pl-6">
          <p data-wb-slot="courses.eyebrow" className="trattoria-eyebrow">
            {courses.eyebrow}
          </p>
          <h2
            data-wb-slot="courses.title"
            className="mt-3 font-serif text-4xl leading-tight text-balance text-primary md:text-5xl"
          >
            {courses.title}
          </h2>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {items.map((item, i) => (
          <Reveal key={item.id} delay={i * 80}>
            <Link
              href={withBasePath(
                basePath,
                `${SHOP_PATH}?coleccion=${item.slug}`,
              )}
              className="group trattoria-menu-card relative flex cursor-pointer overflow-hidden rounded-xl bg-surface"
            >
              <div className="relative h-full min-h-[200px] w-2/5 shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="40vw"
                />
              </div>
              <div className="flex flex-col justify-center px-6 py-8 md:px-8">
                <h3 className="font-serif text-2xl text-primary md:text-3xl">
                  {item.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
                <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
                  Explorar →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
