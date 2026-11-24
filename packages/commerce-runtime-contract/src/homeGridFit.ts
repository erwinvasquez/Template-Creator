import type { CSSProperties } from "react";

/**
 * Grillas de la portada con menos elementos que columnas (2 colecciones en una grilla de 4) dejaban
 * media fila vacía. Con esto, en cada ancho donde faltan elementos la grilla usa solo las columnas que
 * necesita y se centra con el mismo ancho de tarjeta. Las clases son literales para que Tailwind las vea.
 */

export type HomeGridColumns = Readonly<{ sm?: number; md?: number; lg?: number }>;

const FIT_CLASSES = {
  sm: "sm:mx-auto sm:w-full sm:max-w-[var(--home-grid-fit-sm)] sm:[grid-template-columns:repeat(var(--home-grid-cols),minmax(0,1fr))]",
  md: "md:mx-auto md:w-full md:max-w-[var(--home-grid-fit-md)] md:[grid-template-columns:repeat(var(--home-grid-cols),minmax(0,1fr))]",
  lg: "lg:mx-auto lg:w-full lg:max-w-[var(--home-grid-fit-lg)] lg:[grid-template-columns:repeat(var(--home-grid-cols),minmax(0,1fr))]",
} as const;

export function homeGridFitProps(
  count: number,
  columns: HomeGridColumns,
  className: string,
): { className: string; style?: CSSProperties } {
  const extra: string[] = [];
  const style: Record<string, string | number> = {};
  if (count >= 1) {
    for (const bp of ["sm", "md", "lg"] as const) {
      const cols = columns[bp];
      if (!cols || count >= cols) continue;
      extra.push(FIT_CLASSES[bp]);
      style[`--home-grid-fit-${bp}`] = `${((count / cols) * 100).toFixed(3)}%`;
    }
  }
  if (extra.length === 0) return { className };
  style["--home-grid-cols"] = count;
  return { className: `${className} ${extra.join(" ")}`, style: style as CSSProperties };
}
