export type VersionBump = 'major' | 'minor' | 'patch' | 'prerelease';

interface Version {
  major: number;
  minor: number;
  patch: number;
  pre: boolean;
}

export function parseVersion(input: string | undefined): Version | null {
  if (!input) return null;
  const match = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(-[0-9A-Za-z.-]+)?/.exec(input.trim());
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2] ?? 0),
    patch: Number(match[3] ?? 0),
    pre: Boolean(match[4]),
  };
}

/** Classifies `version` relative to the previous (older) release. */
export function detectBump(version: string | undefined, previous: string | undefined): VersionBump | null {
  const v = parseVersion(version);
  if (!v) return null;
  if (v.pre) return 'prerelease';
  const p = parseVersion(previous);
  if (!p) return v.minor === 0 && v.patch === 0 ? 'major' : v.patch === 0 ? 'minor' : 'patch';
  if (v.major !== p.major) return 'major';
  if (v.minor !== p.minor) return 'minor';
  return 'patch';
}
