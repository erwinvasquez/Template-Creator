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
    <footer className="mt-auto border-t border-border bg-ink text-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-8 md:py-20">
        <div>
          <p className="nova-footer-brand text-3xl">{logoText}</p>
          <p
            data-wb-slot="footer.blurb"
            className="mt-4 max-w-xs text-sm leading-relaxed opacity-70"
          >
            {footer.blurb}
          </p>
        </div>

        <div data-wb-slot="footer.columns" className="contents">
          {footer.columns.map((column) => (
            <div key={column.title}>
              <p className="nova-footer-col-title">{column.title}</p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={withBasePath(basePath, link.href)}
                      className="cursor-pointer text-sm opacity-75 transition-opacity duration-200 hover:text-secondary hover:opacity-100"
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
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-6 text-xs opacity-50 md:flex-row md:items-center md:px-8">
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
