/**
 * Theme token map contract — shared checks for template-validate.
 * @see audit/TEMPLATE-THEME-TOKEN-MAP.md
 */

import fs from "node:fs";
import path from "node:path";

const CTA_CLASS_RE = /\b(bg-cta|text-cta|cta-hover)\b/;
const FOOTER_PRIMARY_RE =
  /backgroundColor:\s*["']var\(--color-primary\)["']|className="[^"]*\bbg-primary\b[^"]*"/;

/**
 * @param {string} templateDir absolute path to templates/{id}
 * @returns {string[]}
 */
export function validateThemeTokenContract(templateDir) {
  const errors = [];
  const srcDir = path.join(templateDir, "src");
  if (!fs.existsSync(srcDir)) return errors;

  const footerPath = path.join(srcDir, "components", "Footer.tsx");
  if (fs.existsSync(footerPath)) {
    const footer = fs.readFileSync(footerPath, "utf8");
    if (footer.includes("var(--color-primary)")) {
      errors.push(
        "[theme] Footer.tsx must not use var(--color-primary); use bg-ink (template-fixed)",
      );
    }
    if (/\bclassName="[^"]*\bbg-primary\b/.test(footer) && !footer.includes("bg-ink")) {
      errors.push(
        "[theme] Footer.tsx must use bg-ink for structural background, not bg-primary",
      );
    }
    if (!/\bbg-ink\b/.test(footer)) {
      errors.push(
        "[theme] Footer.tsx must include bg-ink text-background on <footer>",
      );
    }
  }

  walkTsx(srcDir, (file, content) => {
    const rel = path.relative(templateDir, file);
    if (rel.includes("node_modules")) return;
    if (CTA_CLASS_RE.test(content)) {
      errors.push(`[theme] ${rel} uses deprecated bg-cta/text-cta; use primary/secondary per TEMPLATE-THEME-TOKEN-MAP.md`);
    }
  });

  const resolvePath = path.join(srcDir, "content", "resolve.ts");
  if (fs.existsSync(resolvePath)) {
    const resolve = fs.readFileSync(resolvePath, "utf8");
    if (!resolve.includes('"--color-ink"')) {
      errors.push("[theme] themeStyle() must set template-fixed --color-ink");
    }
    if (!resolve.includes("c.cta ?? primary") && !resolve.includes("c.cta ?? c.primary")) {
      errors.push("[theme] themeStyle() must alias --color-cta from primary (c.cta ?? primary)");
    }
  }

  const cssDir = path.join(srcDir, "styles");
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"));
    const hasInk = cssFiles.some((f) => {
      const css = fs.readFileSync(path.join(cssDir, f), "utf8");
      return css.includes("--color-ink");
    });
    if (!hasInk) {
      errors.push("[theme] src/styles/*.css must define --color-ink (template-fixed footer)");
    }
  }

  const builderPath = path.join(templateDir, "builder.manifest.json");
  if (fs.existsSync(builderPath)) {
    const bm = JSON.parse(fs.readFileSync(builderPath, "utf8"));
    const colors = bm.editor?.themeDefaults?.colors ?? bm.themeDefaults?.colors;
    if (colors && !colors.ink) {
      errors.push("[theme] builder.manifest themeDefaults.colors must include ink (not themeEditable)");
    }
  }

  return errors;
}

/**
 * Apply mechanical token map replacements to template src tsx files
 * @param {string} templateDir
 */
export function applyThemeTokenMapToTemplate(templateDir) {
  const srcDir = path.join(templateDir, "src");
  if (!fs.existsSync(srcDir)) return;

  walkTsx(srcDir, (file, content) => {
    let next = content;
    if (file.endsWith("Footer.tsx")) {
      next = next.replace(
        /className="mt-auto border-t border-border bg-primary text-white"/g,
        'className="mt-auto border-t border-border bg-ink text-background"',
      );
      next = next.replace(
        /className="(?:voxa-band-ink|velvet-band-ink|nova-footer)[^"]*"/g,
        'className="mt-auto border-t border-border bg-ink text-background"',
      );
      next = next.replace(
        /<footer\s+className="mt-auto border-t border-border"\s+style=\{\{\s*backgroundColor:\s*"var\(--color-primary\)",\s*color:\s*"var\(--color-background\)",\s*\}\}\s*>/g,
        '<footer className="mt-auto border-t border-border bg-ink text-background">',
      );
    }

    const replacements = [
      [/hover:bg-cta-hover/g, "hover:bg-primary/90"],
      [/bg-cta\/70/g, "bg-secondary/40"],
      [/bg-cta/g, "bg-primary"],
      [/group-hover:text-cta/g, "group-hover:text-primary"],
      [/hover:text-cta-hover/g, "hover:text-secondary"],
      [/hover:decoration-cta/g, "hover:decoration-primary"],
      [/hover:text-cta/g, "hover:text-primary"],
      [/focus-visible:ring-cta/g, "focus-visible:ring-primary"],
      [/text-cta/g, "text-secondary"],
      [/font-medium text-secondary transition-colors hover:text-secondary/g, "font-medium text-primary transition-colors hover:text-secondary"],
      [/uppercase tracking-\[0\.14em\] text-secondary transition-colors duration-200 hover:text-secondary/g, "uppercase tracking-[0.14em] text-primary transition-colors duration-200 hover:text-secondary"],
      [/text-sm text-secondary transition-colors duration-200 hover:text-secondary/g, "text-sm text-primary transition-colors duration-200 hover:text-secondary"],
      [/text-sm text-white\/75 transition-colors duration-200 hover:text-secondary/g, "text-sm text-white/75 transition-colors duration-200 hover:text-primary"],
      [/text-sm text-secondary">\{payload\.brand\.tagline\}/g, 'text-sm text-primary">{payload.brand.tagline}'],
      [/text-xs text-secondary/g, "text-xs text-primary"],
    ];

    for (const [re, rep] of replacements) {
      next = next.replace(re, rep);
    }

    // Buttons on primary should use text-background for contrast
    next = next.replace(
      /bg-primary([^"]*?)text-white/g,
      "bg-primary$1text-background",
    );

    if (next !== content) {
      fs.writeFileSync(file, next);
    }
  });
}

/**
 * Patch themeStyle() in resolve.ts
 * @param {string} templateDir
 * @param {{ ink: string, defaults: Record<string, string> }} config
 */
export function patchThemeStyle(templateDir, config) {
  const resolvePath = path.join(templateDir, "src", "content", "resolve.ts");
  if (!fs.existsSync(resolvePath)) return;

  const d = config.defaults;
  const body = `export function themeStyle(payload: ContentPayload): Record<string, string> {
  const c = payload.theme?.colors ?? {};
  const primary = c.primary ?? "${d.primary}";
  const secondary = c.secondary ?? "${d.secondary}";
  return {
    "--color-primary": primary,
    "--color-secondary": secondary,
    "--color-background": c.background ?? "${d.background}",
    "--color-surface": c.surface ?? "${d.surface}",
    "--color-text": c.text ?? "${d.text}",
    "--color-muted": c.muted ?? "${d.muted}",
    "--color-border": c.border ?? "${d.border}",
    "--color-ink": "${config.ink}",
    "--color-cta": c.cta ?? primary,
    "--color-cta-hover": c.ctaHover ?? secondary,
  };
}`;

  let src = fs.readFileSync(resolvePath, "utf8");
  src = src.replace(/export function themeStyle\([\s\S]*?\n\}/, body);
  fs.writeFileSync(resolvePath, src);
}

/**
 * Ensure --color-ink in :root and @theme of main css
 */
export function ensureInkInCss(templateDir, ink) {
  const stylesDir = path.join(templateDir, "src", "styles");
  if (!fs.existsSync(stylesDir)) return;
  for (const file of fs.readdirSync(stylesDir).filter((f) => f.endsWith(".css"))) {
    const p = path.join(stylesDir, file);
    let css = fs.readFileSync(p, "utf8");
    if (css.includes("--color-ink")) continue;
    css = css.replace(
      /(:root\s*\{[^}]*)(--color-border:[^;]+;)/,
      `$1$2\n  --color-ink: ${ink};`,
    );
    css = css.replace(
      /(@theme\s*\{[^}]*)(--color-border:[^;]+;)/,
      `$1$2\n  --color-ink: ${ink};`,
    );
    fs.writeFileSync(p, css);
  }
}

/**
 * Add ink to builder.manifest themeDefaults.colors if missing
 */
export function ensureInkInBuilderManifest(templateDir, ink) {
  const p = path.join(templateDir, "builder.manifest.json");
  if (!fs.existsSync(p)) return;
  const bm = JSON.parse(fs.readFileSync(p, "utf8"));
  const root = bm.editor ?? bm;
  if (!root.themeDefaults) root.themeDefaults = { colors: {} };
  if (!root.themeDefaults.colors) root.themeDefaults.colors = {};
  if (!root.themeDefaults.colors.ink) {
    root.themeDefaults.colors.ink = ink.toUpperCase().replace(
      /^#([0-9a-f]{6})$/i,
      (_, h) => `#${h.toUpperCase()}`,
    );
    fs.writeFileSync(p, JSON.stringify(bm, null, 2) + "\n");
  }
}

function walkTsx(dir, fn) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkTsx(full, fn);
    else if (ent.name.endsWith(".tsx")) fn(full, fs.readFileSync(full, "utf8"));
  }
}

export const THEME_TEMPLATE_CONFIG = {
  "fashion-atelier-v1": {
    ink: "#1c1917",
    defaults: {
      primary: "#1c1917",
      secondary: "#44403c",
      background: "#fafaf9",
      surface: "#f5f5f4",
      text: "#0c0a09",
      muted: "#57534e",
      border: "#e7e5e4",
    },
  },
  "fashion-celestine-v1": {
    ink: "#120d10",
    defaults: {
      primary: "#1a1216",
      secondary: "#6b4e56",
      background: "#f8f4f5",
      surface: "#efe6e8",
      text: "#1a1216",
      muted: "#746266",
      border: "#e0d4d7",
    },
  },
  "fashion-lumen-v1": {
    ink: "#0f0f0f",
    defaults: {
      primary: "#0f0f0f",
      secondary: "#2a2a2a",
      background: "#f2f2ed",
      surface: "#e8e8e2",
      text: "#0f0f0f",
      muted: "#4a4a4a",
      border: "#d4d4cc",
    },
  },
  "jewelry-orion-v1": {
    ink: "#0e0e10",
    defaults: {
      primary: "#141210",
      secondary: "#5c564f",
      background: "#fafaf8",
      surface: "#f0ede8",
      text: "#121212",
      muted: "#6b6560",
      border: "#ddd6cc",
    },
  },
  "academy-voxa-v1": {
    ink: "#0b1220",
    defaults: {
      primary: "#14213d",
      secondary: "#3a506b",
      background: "#f4f6f8",
      surface: "#e8eef2",
      text: "#12141a",
      muted: "#5c6570",
      border: "#d5dde5",
    },
  },
};
