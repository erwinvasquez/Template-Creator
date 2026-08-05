"use client";

import Link from "next/link";
import { useSiteContent } from "../lib/site-content";
import { withBasePath } from "../content/resolve";

export function Footer() {
  const { payload, basePath } = useSiteContent();
  const { footer } = payload.sections;
  const logoText = payload.brand.displayName || payload.brand.name;
  const copyrightName = footer.copyrightName || payload.brand.name;

  return (
    <footer className="mt-auto border-t border-border bg-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:px-10 md:py-20">
        <div>
          <p className="font-serif text-2xl tracking-[0.14em]">{logoText}</p>
          <p
            data-wb-slot="footer.blurb"
            className="mt-4 max-w-sm text-sm leading-relaxed text-white/65"
          >
            {footer.blurb}
          </p>
        </div>

        <div data-wb-slot="footer.columns" className="grid grid-cols-2 gap-8">
          {footer.columns.map((column) => (
            <div key={column.title}>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={withBasePath(basePath, link.href)}
                      className="cursor-pointer text-sm text-white/75 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-6 text-xs text-white/45 md:flex-row md:items-center md:px-10">
          <p data-wb-slot="footer.copyrightName">
            © {new Date().getFullYear()} {copyrightName}
          </p>
          {footer.tagline ? (
            <p data-wb-slot="footer.tagline">{footer.tagline}</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
