import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#0C0A09] px-6 text-center text-[#FAFAF9]">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#CA8A04]">
        404
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-wide md:text-5xl">
        Página no encontrada
      </h1>
      <p className="mt-4 text-sm text-white/55">
        Esta ruta no existe en el laboratorio de templates.
      </p>
      <Link
        href="/"
        className="mt-8 cursor-pointer border border-white/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors duration-200 hover:border-[#CA8A04] hover:text-[#CA8A04]"
      >
        Volver al selector
      </Link>
    </div>
  );
}
