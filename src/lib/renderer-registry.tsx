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
import type {
  ContentPayload as LumenContentPayload,
  TemplatePage as LumenTemplatePage,
} from "fashion-lumen-v1";
import {
  TemplateApp as LumenTemplateApp,
  DEFAULT_BASE_PATH as LUMEN_DEFAULT_BASE_PATH,
  TEMPLATE_ID as LUMEN_TEMPLATE_ID,
  loadManifest as loadLumenManifest,
  loadPayload as loadLumenPayload,
} from "fashion-lumen-v1";
import type {
  ContentPayload as VelvetContentPayload,
  TemplatePage as VelvetTemplatePage,
} from "fashion-velvet-v1";
import {
  TemplateApp as VelvetTemplateApp,
  DEFAULT_BASE_PATH as VELVET_DEFAULT_BASE_PATH,
  TEMPLATE_ID as VELVET_TEMPLATE_ID,
  loadManifest as loadVelvetManifest,
  loadPayload as loadVelvetPayload,
} from "fashion-velvet-v1";
import type {
  ContentPayload as NovaContentPayload,
  TemplatePage as NovaTemplatePage,
} from "fashion-nova-v1";
import {
  TemplateApp as NovaTemplateApp,
  DEFAULT_BASE_PATH as NOVA_DEFAULT_BASE_PATH,
  TEMPLATE_ID as NOVA_TEMPLATE_ID,
  loadManifest as loadNovaManifest,
  loadPayload as loadNovaPayload,
} from "fashion-nova-v1";
import type {
  ContentPayload as TrattoriaContentPayload,
  TemplatePage as TrattoriaTemplatePage,
} from "food-trattoria-v1";
import {
  TemplateApp as TrattoriaTemplateApp,
  DEFAULT_BASE_PATH as TRATTORIA_DEFAULT_BASE_PATH,
  TEMPLATE_ID as TRATTORIA_TEMPLATE_ID,
  loadManifest as loadTrattoriaManifest,
  loadPayload as loadTrattoriaPayload,
} from "food-trattoria-v1";
import type {
  ContentPayload as CantinaContentPayload,
  TemplatePage as CantinaTemplatePage,
} from "food-cantina-v1";
import {
  TemplateApp as CantinaTemplateApp,
  DEFAULT_BASE_PATH as CANTINA_DEFAULT_BASE_PATH,
  TEMPLATE_ID as CANTINA_TEMPLATE_ID,
  loadManifest as loadCantinaManifest,
  loadPayload as loadCantinaPayload,
} from "food-cantina-v1";
import type {
  ContentPayload as PatisserieContentPayload,
  TemplatePage as PatisserieTemplatePage,
} from "food-patisserie-v1";
import {
  TemplateApp as PatisserieTemplateApp,
  DEFAULT_BASE_PATH as PATISSERIE_DEFAULT_BASE_PATH,
  TEMPLATE_ID as PATISSERIE_TEMPLATE_ID,
  loadManifest as loadPatisserieManifest,
  loadPayload as loadPatisseriePayload,
} from "food-patisserie-v1";

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

export const lumenRenderer: TemplateRenderer<
  LumenContentPayload,
  LumenTemplatePage
> = {
  templateId: LUMEN_TEMPLATE_ID,
  slug: "lumen",
  basePath: LUMEN_DEFAULT_BASE_PATH,
  getManifest: () => loadLumenManifest(),
  getDefaults: () => loadLumenPayload(),
  loadPayload: loadLumenPayload,
  renderApp: ({ page, payload, basePath = LUMEN_DEFAULT_BASE_PATH, slug }) => (
    <LumenTemplateApp
      page={page}
      payload={payload}
      basePath={basePath}
      slug={slug}
    />
  ),
};

export const velvetRenderer: TemplateRenderer<
  VelvetContentPayload,
  VelvetTemplatePage
> = {
  templateId: VELVET_TEMPLATE_ID,
  slug: "velvet",
  basePath: VELVET_DEFAULT_BASE_PATH,
  getManifest: () => loadVelvetManifest(),
  getDefaults: () => loadVelvetPayload(),
  loadPayload: loadVelvetPayload,
  renderApp: ({ page, payload, basePath = VELVET_DEFAULT_BASE_PATH, slug }) => (
    <VelvetTemplateApp
      page={page}
      payload={payload}
      basePath={basePath}
      slug={slug}
    />
  ),
};

export const novaRenderer: TemplateRenderer<
  NovaContentPayload,
  NovaTemplatePage
> = {
  templateId: NOVA_TEMPLATE_ID,
  slug: "nova",
  basePath: NOVA_DEFAULT_BASE_PATH,
  getManifest: () => loadNovaManifest(),
  getDefaults: () => loadNovaPayload(),
  loadPayload: loadNovaPayload,
  renderApp: ({ page, payload, basePath = NOVA_DEFAULT_BASE_PATH, slug }) => (
    <NovaTemplateApp
      page={page}
      payload={payload}
      basePath={basePath}
      slug={slug}
    />
  ),
};

export const trattoriaRenderer: TemplateRenderer<
  TrattoriaContentPayload,
  TrattoriaTemplatePage
> = {
  templateId: TRATTORIA_TEMPLATE_ID,
  slug: "trattoria",
  basePath: TRATTORIA_DEFAULT_BASE_PATH,
  getManifest: () => loadTrattoriaManifest(),
  getDefaults: () => loadTrattoriaPayload(),
  loadPayload: loadTrattoriaPayload,
  renderApp: ({
    page,
    payload,
    basePath = TRATTORIA_DEFAULT_BASE_PATH,
    slug,
  }) => (
    <TrattoriaTemplateApp
      page={page}
      payload={payload}
      basePath={basePath}
      slug={slug}
    />
  ),
};

export const cantinaRenderer: TemplateRenderer<
  CantinaContentPayload,
  CantinaTemplatePage
> = {
  templateId: CANTINA_TEMPLATE_ID,
  slug: "cantina",
  basePath: CANTINA_DEFAULT_BASE_PATH,
  getManifest: () => loadCantinaManifest(),
  getDefaults: () => loadCantinaPayload(),
  loadPayload: loadCantinaPayload,
  renderApp: ({
    page,
    payload,
    basePath = CANTINA_DEFAULT_BASE_PATH,
    slug,
  }) => (
    <CantinaTemplateApp
      page={page}
      payload={payload}
      basePath={basePath}
      slug={slug}
    />
  ),
};

export const patisserieRenderer: TemplateRenderer<
  PatisserieContentPayload,
  PatisserieTemplatePage
> = {
  templateId: PATISSERIE_TEMPLATE_ID,
  slug: "patisserie",
  basePath: PATISSERIE_DEFAULT_BASE_PATH,
  getManifest: () => loadPatisserieManifest(),
  getDefaults: () => loadPatisseriePayload(),
  loadPayload: loadPatisseriePayload,
  renderApp: ({
    page,
    payload,
    basePath = PATISSERIE_DEFAULT_BASE_PATH,
    slug,
  }) => (
    <PatisserieTemplateApp
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
  lumenRenderer,
  velvetRenderer,
  novaRenderer,
  trattoriaRenderer,
  cantinaRenderer,
  patisserieRenderer,
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
