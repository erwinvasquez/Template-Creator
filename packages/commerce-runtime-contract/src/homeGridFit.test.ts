import { describe, expect, it } from "vitest";

import { homeGridFitProps } from "./homeGridFit";

describe("homeGridFitProps", () => {
  it("con la grilla llena no cambia nada", () => {
    expect(homeGridFitProps(4, { sm: 2, lg: 4 }, "grid")).toEqual({ className: "grid" });
    expect(homeGridFitProps(7, { md: 3 }, "grid")).toEqual({ className: "grid" });
  });

  it("2 elementos en una grilla de 4: dos columnas centradas a la mitad del ancho", () => {
    const props = homeGridFitProps(2, { sm: 2, lg: 4 }, "grid gap-6");
    expect(props.className).toContain("lg:max-w-[var(--home-grid-fit-lg)]");
    expect(props.className).not.toContain("sm:max-w");
    expect(props.style).toEqual({ "--home-grid-fit-lg": "50.000%", "--home-grid-cols": 2 });
  });

  it("1 elemento ajusta todos los anchos donde falta", () => {
    const props = homeGridFitProps(1, { sm: 2, lg: 4 }, "grid");
    expect(props.style).toEqual({
      "--home-grid-fit-sm": "50.000%",
      "--home-grid-fit-lg": "25.000%",
      "--home-grid-cols": 1,
    });
  });
});
