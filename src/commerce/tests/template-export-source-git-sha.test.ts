import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  resolveSourceGitSha,
} from "../../../scripts/lib/export-build-info.mjs";

const ROOT = path.resolve(__dirname, "../../..");
const TEMPLATE = "fashion-atelier-v1";
const BUILD_INFO = path.join(
  ROOT,
  "dist",
  "packages",
  TEMPLATE,
  "BUILD_INFO.json",
);

describe("resolveSourceGitSha", () => {
  const hash = "abc123";

  it("a) primer export: sin previous usa SOURCE_GIT_SHA o HEAD", () => {
    expect(
      resolveSourceGitSha(null, hash, {
        env: { SOURCE_GIT_SHA: "1111111111111111111111111111111111111111" },
      }),
    ).toBe("1111111111111111111111111111111111111111");

    expect(
      resolveSourceGitSha(null, hash, {
        getHeadSha: () => "2222222222222222222222222222222222222222",
      }),
    ).toBe("2222222222222222222222222222222222222222");
  });

  it("b) mismo contentHash conserva sourceGitSha aunque HEAD/env cambien", () => {
    const previous = {
      contentHash: hash,
      sourceGitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    };
    expect(
      resolveSourceGitSha(previous, hash, {
        env: { SOURCE_GIT_SHA: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" },
        getHeadSha: () => "cccccccccccccccccccccccccccccccccccccccc",
      }),
    ).toBe("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  });

  it("c) contentHash distinto permite nuevo sourceGitSha", () => {
    const previous = {
      contentHash: "old",
      sourceGitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    };
    expect(
      resolveSourceGitSha(previous, hash, {
        env: { SOURCE_GIT_SHA: "dddddddddddddddddddddddddddddddddddddddd" },
      }),
    ).toBe("dddddddddddddddddddddddddddddddddddddddd");
  });
});

describe("template-export integration — sourceGitSha", () => {
  it("a/b) export guarda sourceGitSha y el segundo export lo conserva si el contenido no cambia", () => {
    const baseEnv = { ...process.env, SOURCE_DATE_EPOCH: "0" };
    execSync(`node scripts/template-export.mjs ${TEMPLATE}`, {
      cwd: ROOT,
      stdio: "pipe",
      env: baseEnv,
    });
    const first = JSON.parse(fs.readFileSync(BUILD_INFO, "utf8")) as {
      sourceGitSha: string;
      contentHash: string;
    };
    expect(first.sourceGitSha).toMatch(/^[0-9a-f]{40}$/);

    execSync(`node scripts/template-export.mjs ${TEMPLATE}`, {
      cwd: ROOT,
      stdio: "pipe",
      env: {
        ...baseEnv,
        SOURCE_GIT_SHA: "ffffffffffffffffffffffffffffffffffffffff",
      },
    });
    const second = JSON.parse(fs.readFileSync(BUILD_INFO, "utf8")) as {
      sourceGitSha: string;
      contentHash: string;
    };
    expect(second.contentHash).toBe(first.contentHash);
    expect(second.sourceGitSha).toBe(first.sourceGitSha);
  });
});
