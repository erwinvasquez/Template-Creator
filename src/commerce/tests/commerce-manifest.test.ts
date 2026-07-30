import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");

describe("commerce.schema.json", () => {
  const schema = JSON.parse(
    fs.readFileSync(
      path.join(root, "templates/fashion-atelier-v1/commerce.schema.json"),
      "utf8",
    ),
  );
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  it("accepts atelier manifest.commerce", () => {
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(root, "templates/fashion-atelier-v1/manifest.json"),
        "utf8",
      ),
    );
    expect(validate(manifest.commerce)).toBe(true);
  });

  it("accepts orion manifest.commerce", () => {
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(root, "templates/jewelry-orion-v1/manifest.json"),
        "utf8",
      ),
    );
    expect(validate(manifest.commerce)).toBe(true);
  });

  it("keeps orion routes inside the contract page ids", () => {
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(root, "templates/jewelry-orion-v1/manifest.json"),
        "utf8",
      ),
    );
    const pages = manifest.routes.map((r: { page: string }) => r.page);
    expect(pages).toEqual(["home", "shop", "product", "about"]);
  });

  it("rejects missing views keys", () => {
    const bad = {
      mode: "preview-only",
      contractVersion: null,
      views: { productListing: true },
      capabilities: {},
    };
    expect(validate(bad)).toBe(false);
  });
});
