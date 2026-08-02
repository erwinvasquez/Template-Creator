import type { ContentPayload, TemplatePage } from "fashion-atelier-v1";
import {
  TemplateApp as AtelierTemplateApp,
  DEFAULT_BASE_PATH,
  TEMPLATE_ID,
  loadManifest,
  loadPayload,
} from "fashion-atelier-v1";
import type {
  ContentPayload as OrionContentPayload,
  TemplatePage as OrionTemplatePage,
} from "jewelry-orion-v1";
import {
  TemplateApp as OrionTemplateApp,
  DEFAULT_BASE_PATH as ORION_DEFAULT_BASE_PATH,
  TEMPLATE_ID as ORION_TEMPLATE_ID,
  loadManifest as loadOrionManifest,
  loadPayload as loadOrionPayload,
} from "jewelry-orion-v1";
import type {
  ContentPayload as VoxaContentPayload,
  TemplatePage as VoxaTemplatePage,
} from "academy-voxa-v1";
import {
  TemplateApp as VoxaTemplateApp,
  DEFAULT_BASE_PATH as VOXA_DEFAULT_BASE_PATH,
  TEMPLATE_ID as VOXA_TEMPLATE_ID,
  loadManifest as loadVoxaManifest,
  loadPayload as loadVoxaPayload,
} from "academy-voxa-v1";
import type {
  ContentPayload as CelestineContentPayload,
  TemplatePage as CelestineTemplatePage,
} from "fashion-celestine-v1";
import {
  TemplateApp as CelestineTemplateApp,
  DEFAULT_BASE_PATH as CELESTINE_DEFAULT_BASE_PATH,
  TEMPLATE_ID as CELESTINE_TEMPLATE_ID,
  loadManifest as loadCelestineManifest,
  loadPayload as loadCelestinePayload,
} from "fashion-celestine-v1";

export type TemplateRenderer<TPayload = ContentPayload, TPage = TemplatePage> = {
  templateId: string;
  slug: string;
  basePath: string;
  getManifest: () => Record<string, unknown>;
  getDefaults: () => TPayload;
  loadPayload: (fixture?: string) => TPayload;
  renderApp: (args: {
    page: TPage;
    payload: TPayload;
    basePath?: string;
    slug?: string;
  }) => React.ReactNode;
};

export const atelierRenderer: TemplateRenderer<ContentPayload, TemplatePage> = {
  templateId: TEMPLATE_ID,
  slug: "atelier",
  basePath: DEFAULT_BASE_PATH,
  getManifest: () => loadManifest(),
  getDefaults: () => loadPayload(),
  loadPayload,
  renderApp: ({ page, payload, basePath = DEFAULT_BASE_PATH, slug }) => (
    <AtelierTemplateApp
      page={page}
      payload={payload}
      basePath={basePath}
      slug={slug}
    />
  ),
};

export const orionRenderer: TemplateRenderer<
  OrionContentPayload,
  OrionTemplatePage
> = {
  templateId: ORION_TEMPLATE_ID,
  slug: "orion",
  basePath: ORION_DEFAULT_BASE_PATH,
  getManifest: () => loadOrionManifest(),
  getDefaults: () => loadOrionPayload(),
  loadPayload: loadOrionPayload,
  renderApp: ({ page, payload, basePath = ORION_DEFAULT_BASE_PATH, slug }) => (
    <OrionTemplateApp
      page={page}
      payload={payload}
      basePath={basePath}
      slug={slug}
    />
  ),
};

export const voxaRenderer: TemplateRenderer<
  VoxaContentPayload,
  VoxaTemplatePage
> = {
  templateId: VOXA_TEMPLATE_ID,
  slug: "voxa",
  basePath: VOXA_DEFAULT_BASE_PATH,
  getManifest: () => loadVoxaManifest(),
  getDefaults: () => loadVoxaPayload(),
  loadPayload: loadVoxaPayload,
  renderApp: ({ page, payload, basePath = VOXA_DEFAULT_BASE_PATH, slug }) => (
    <VoxaTemplateApp
      page={page}
      payload={payload}
      basePath={basePath}
      slug={slug}
    />
  ),
};

export const celestineRenderer: TemplateRenderer<
  CelestineContentPayload,
  CelestineTemplatePage
> = {
  templateId: CELESTINE_TEMPLATE_ID,
  slug: "celestine",
  basePath: CELESTINE_DEFAULT_BASE_PATH,
  getManifest: () => loadCelestineManifest(),
  getDefaults: () => loadCelestinePayload(),
  loadPayload: loadCelestinePayload,
  renderApp: ({
    page,
    payload,
    basePath = CELESTINE_DEFAULT_BASE_PATH,
    slug,
  }) => (
    <CelestineTemplateApp
      page={page}
      payload={payload}
      basePath={basePath}
      slug={slug}
    />
  ),
};

const renderers: TemplateRenderer<any, any>[] = [
  atelierRenderer,
  orionRenderer,
  voxaRenderer,
  celestineRenderer,
];

export function listRenderers(): TemplateRenderer<any, any>[] {
  return renderers;
}

export function getRenderer(templateId: string): TemplateRenderer<any, any> {
  const found = renderers.find((r) => r.templateId === templateId);
  if (!found) throw new Error(`Renderer not found: ${templateId}`);
  return found;
}

export function listTemplatesForGallery() {
  return renderers.map((r) => {
    const manifest = r.getManifest() as {
      name?: string;
      displayName?: string;
      description?: string;
      category?: string;
      version?: string;
      preview?: { path?: string; thumbnail?: string };
      theme?: { colors?: { cta?: string } };
    };
    const defaults = r.getDefaults();
    return {
      id: r.templateId,
      slug: r.slug,
      name: manifest.name ?? defaults.brand.name,
      tagline: defaults.brand.tagline ?? manifest.description ?? "",
      category: manifest.category ?? "template",
      version: manifest.version ?? defaults.templateVersion,
      href: manifest.preview?.path ?? r.basePath,
      status: "ready" as const,
      previewImage:
        manifest.preview?.thumbnail ??
        defaults.sections.hero.image.url ??
        "",
      accent:
        (defaults as { theme?: { colors?: { cta?: string } } }).theme?.colors
          ?.cta ?? "#B8956A",
    };
  });
}
