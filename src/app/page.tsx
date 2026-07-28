import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listTemplatesForGallery } from "@/lib/renderer-registry";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Selecciona un template descubierto vía renderer registry. Cada template exporta un package portable para IA Builder v2.",
};

export default function TemplateSelectorPage() {
  const templates = listTemplatesForGallery();

  return (
    <div className="min-h-full bg-[#0C0A09] text-[#FAFAF9]">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(202,138,4,0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(68,64,60,0.35), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
        <header className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#CA8A04]">
            Web Generator
          </p>
          <h1 className="mt-4 font-serif text-4xl tracking-wide text-balance md:text-6xl">
            Templates
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/65 md:text-base">
            Galería descubierta desde el renderer registry. Preview payload-driven
            (`defaults.json`). Prueba alt:{" "}
            <code className="text-white/80">/t/atelier?payload=alt-brand</code>
            {" · "}
            <code className="text-white/80">/t/atelier?payload=brand-verde</code>
          </p>
        </header>

        <ul className="mt-14 grid gap-6 md:grid-cols-2">
          {templates.map((template) => {
            const Card = (
              <article className="group overflow-hidden border border-white/10 bg-white/[0.03] transition-colors duration-200 hover:border-[#CA8A04]/50 hover:bg-white/[0.05]">
                <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                  {template.previewImage ? (
                    <Image
                      src={template.previewImage}
                      alt={`Preview ${template.name}`}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09]/80 via-transparent to-transparent" />
                  <span
                    className="absolute left-4 top-4 text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: template.accent }}
                  >
                    {template.category}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4 p-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-serif text-3xl tracking-wide">
                        {template.name}
                      </h2>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                        v{template.version}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">
                      {template.tagline}
                    </p>
                    <p className="mt-3 font-mono text-[11px] text-white/35">
                      {template.id}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="mt-1 h-5 w-5 shrink-0 text-white/40 transition-colors duration-200 group-hover:text-[#CA8A04]"
                    strokeWidth={1.5}
                  />
                </div>
              </article>
            );

            return (
              <li key={template.id}>
                <Link href={template.href} className="block cursor-pointer">
                  {Card}
                </Link>
              </li>
            );
          })}
        </ul>

        <footer className="mt-16 border-t border-white/10 pt-8 text-xs text-white/40">
          <p>
            Package:{" "}
            <code className="text-white/60">
              templates/fashion-atelier-v1/
            </code>{" "}
            → export{" "}
            <code className="text-white/60">
              dist/packages/fashion-atelier-v1/
            </code>
          </p>
        </footer>
      </div>
    </div>
  );
}
