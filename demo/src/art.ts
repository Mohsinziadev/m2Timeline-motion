/**
 * Deterministic, offline-safe illustrations (SVG data URIs) so the demo never depends on an image CDN.
 */

function svg(content: string, w = 960, h = 600) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${content}</svg>`,
  )}`;
}

/** Soft, flat abstract art: a light base colour with a few calm shapes (no gradients). */
export function abstractArt(seed: number, a: string, b: string) {
  const r = (n: number) => ((Math.sin(seed * 9301 + n * 49297) + 1) / 2) * 0.8 + 0.1;
  return svg(`
    <rect width="960" height="600" fill="${a}"/>
    <circle cx="${r(3) * 960}" cy="${r(4) * 600}" r="${150 + r(5) * 150}" fill="${b}" opacity=".7"/>
    <circle cx="${r(6) * 960}" cy="${r(7) * 600}" r="${110 + r(8) * 120}" fill="#fff" opacity=".45"/>
    <g fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3">
      <circle cx="${r(9) * 960}" cy="${r(10) * 600}" r="${60 + r(11) * 90}"/>
      <path d="M0 ${420 + r(12) * 80} C 240 ${340 + r(13) * 120}, 520 ${520 - r(14) * 120}, 960 ${380 + r(15) * 90}"/>
    </g>`);
}

/** Night sky with a planet, for the space-history dataset. */
export function spaceArt(seed: number, planet: string, glow: string) {
  const r = (n: number) => (Math.sin(seed * 7919 + n * 104729) + 1) / 2;
  const stars = Array.from({ length: 70 }, (_, i) => {
    const x = r(i * 3) * 960;
    const y = r(i * 3 + 1) * 600;
    const s = 0.6 + r(i * 3 + 2) * 1.8;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(2)}" fill="#fff" opacity="${(0.35 + r(i) * 0.65).toFixed(2)}"/>`;
  }).join('');
  const cx = 300 + r(400) * 360;
  return svg(`
    <rect width="960" height="600" fill="#1d2440"/>
    ${stars}
    <circle cx="${cx}" cy="${360 + r(401) * 120}" r="190" fill="${glow}" opacity=".18"/>
    <circle cx="${cx}" cy="${360 + r(401) * 120}" r="170" fill="${planet}"/>
    <circle cx="${cx - 40}" cy="${330 + r(401) * 120}" r="120" fill="${glow}" opacity=".35"/>`);
}

/** Simple monogram logo tile. */
export function logoArt(letter: string, a: string, _b?: string) {
  return svg(
    `<rect width="96" height="96" rx="22" fill="${a}"/>
     <text x="48" y="62" text-anchor="middle" font-family="Figtree, system-ui, sans-serif" font-size="44" font-weight="700" fill="#fff">${letter}</text>`,
    96,
    96,
  );
}
