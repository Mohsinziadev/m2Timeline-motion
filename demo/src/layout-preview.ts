import type { LayoutVariant } from 'm2timeline-motion';
import { generateCode, initialConfig } from './config';
import { datasets } from './data';
import type { VariantInfo } from './variants';

/** Keep previews to a screenful of items. */
const LIMIT: Partial<Record<LayoutVariant, number>> = {
  vertical: 5,
  minimal: 6,
  career: 3,
  history: 4,
  changelog: 2,
  feed: 6,
  cards: 3,
  story: 2,
  alternating: 4,
};

export function previewEvents(v: VariantInfo) {
  const all = datasets[v.dataset];
  const limited = LIMIT[v.id] ? all.slice(0, LIMIT[v.id]) : all;
  // The alternating preview shows its text rhythm; the history layout shows the media.
  return v.id === 'alternating' ? limited.map(({ image: _image, ...e }) => e) : limited;
}

export function snippet(v: VariantInfo): string {
  const config = { ...initialConfig(v.id), logEvents: false };
  return generateCode(config, datasets[v.dataset], { style: 'component', fullData: false });
}
