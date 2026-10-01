/**
 * Deterministic BUILD_INFO fields for template-export (testable).
 */

export function resolveExportedAt(previousBuildInfo, contentHash, env = process.env) {
  if (previousBuildInfo?.contentHash === contentHash && previousBuildInfo.exportedAt) {
    return previousBuildInfo.exportedAt;
  }
  if (env.SOURCE_DATE_EPOCH) {
    return new Date(Number(env.SOURCE_DATE_EPOCH) * 1000).toISOString();
  }
  return new Date().toISOString();
}

/**
 * @param {Record<string, unknown> | null} previousBuildInfo
 * @param {string} contentHash
 * @param {{ getHeadSha?: () => string, env?: Record<string, string | undefined> }} options
 */
export function resolveSourceGitSha(previousBuildInfo, contentHash, options = {}) {
  const env = options.env ?? process.env;
  if (
    previousBuildInfo?.contentHash === contentHash &&
    typeof previousBuildInfo.sourceGitSha === "string" &&
    previousBuildInfo.sourceGitSha.length > 0
  ) {
    return previousBuildInfo.sourceGitSha;
  }
  const fromEnv = (env.SOURCE_GIT_SHA || env.WG_SOURCE_GIT_SHA || "").trim();
  if (fromEnv) {
    return fromEnv;
  }
  if (options.getHeadSha) {
    try {
      return options.getHeadSha();
    } catch {
      return "";
    }
  }
  return "";
}
