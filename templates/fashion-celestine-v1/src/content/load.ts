import fs from "node:fs";
import path from "node:path";
import defaultsJson from "../../defaults.json";
import type { ContentPayload } from "./types";
import { validatePayload } from "./validate";

function packageRootCandidates(): string[] {
  return [
    path.join(/* turbopackIgnore: true */ process.cwd(), "templates/fashion-celestine-v1"),
    path.join(/* turbopackIgnore: true */ process.cwd(), "dist/packages/fashion-celestine-v1"),
    path.join(
      /* turbopackIgnore: true */ process.cwd(),
      "node_modules/@web-generator/fashion-celestine-v1",
    ),
    path.join(
      /* turbopackIgnore: true */ process.cwd(),
      "../../dist/packages/fashion-celestine-v1",
    ),
    /* turbopackIgnore: true */ process.cwd(),
  ];
}

export function getPackageRoot(): string {
  for (const root of packageRootCandidates()) {
    if (fs.existsSync(path.join(root, "defaults.json"))) return root;
  }
  throw new Error("fashion-celestine-v1 package root not found");
}

export function loadPayload(fixture?: string): ContentPayload {
  let raw: ContentPayload;

  if (!fixture || fixture === "defaults") {
    raw = defaultsJson as ContentPayload;
  } else {
    const file = path.join(getPackageRoot(), "fixtures", `${fixture}.json`);
    if (!fs.existsSync(file)) {
      throw new Error(`Payload fixture not found: ${file}`);
    }
    raw = JSON.parse(fs.readFileSync(file, "utf8")) as ContentPayload;
  }

  const result = validatePayload(raw);
  if (!result.ok) {
    throw new Error(
      `Invalid payload (${fixture ?? "defaults"}):\n${result.errors.join("\n")}`,
    );
  }
  return raw;
}

export function loadManifest(): Record<string, unknown> {
  const file = path.join(getPackageRoot(), "manifest.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
}
