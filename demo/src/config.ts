import type {
  LayoutVariant,
  TimelineAnimation,
  TimelineAppearance,
  TimelineConnectorStyle,
  TimelineDensity,
  TimelineEvent,
  TimelineMarkerShape,
  TimelineOrder,
  TimelineTheme,
} from 'm2timeline-motion';
import type { DatasetKey } from './data';
import { variantById } from './variants';

export type GroupChoice = 'default' | 'none' | 'year' | 'quarter' | 'month' | 'group' | 'category';
export type ExpandChoice = 'multiple' | 'single' | 'off';

export interface PlaygroundConfig {
  variant: LayoutVariant;
  dataset: DatasetKey;
  theme: TimelineTheme;
  appearance: TimelineAppearance;
  /** Empty string = the appearance's own accent. */
  accent: string;
  gradient: boolean;
  accent2: string;
  density: TimelineDensity;
  /** `null` = the appearance's own radius. */
  radius: number | null;
  marker: TimelineMarkerShape;
  connector: TimelineConnectorStyle;
  connectorAnimated: boolean;
  glow: boolean;
  animation: TimelineAnimation;
  duration: number;
  stagger: number;
  order: TimelineOrder;
  groupBy: GroupChoice;
  search: boolean;
  filters: boolean;
  jumpTo: boolean;
  expandable: ExpandChoice;
  trackActive: boolean;
  scrollProgress: boolean;
  pageSize: number;
  logEvents: boolean;
  options: Record<string, string | number | boolean>;
}

export function defaultOptions(variant: LayoutVariant): Record<string, string | number | boolean> {
  return Object.fromEntries(variantById[variant].options.map((o) => [o.key, o.default]));
}

export function initialConfig(variant: LayoutVariant = 'alternating'): PlaygroundConfig {
  return {
    variant,
    dataset: variantById[variant].dataset,
    theme: 'light',
    appearance: 'modern',
    accent: '',
    gradient: false,
    accent2: '#ec4899',
    density: 'comfortable',
    radius: null,
    marker: 'dot',
    connector: 'solid',
    connectorAnimated: false,
    glow: true,
    animation: 'rise',
    duration: 600,
    stagger: 70,
    order: 'none',
    groupBy: 'default',
    search: false,
    filters: false,
    jumpTo: false,
    expandable: 'multiple',
    trackActive: false,
    scrollProgress: false,
    pageSize: 0,
    logEvents: true,
    options: defaultOptions(variant),
  };
}

/** Props that differ from the library defaults — used for both the preview and the generated code. */
export function buildProps(c: PlaygroundConfig): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (c.theme !== 'auto') p.theme = c.theme;
  if (c.appearance !== 'modern') p.appearance = c.appearance;
  if (c.accent) p.accent = c.gradient ? [c.accent, c.accent2] : c.accent;
  if (c.density !== 'comfortable') p.density = c.density;
  if (c.radius !== null) p.radius = c.radius;
  if (c.marker !== 'dot') p.marker = c.marker;
  if (c.connector !== 'solid') p.connector = c.connector;
  if (c.connectorAnimated) p.connectorAnimated = true;
  if (!c.glow) p.glow = false;
  if (c.animation !== 'rise') p.animation = c.animation;
  if (c.animation !== 'none' && c.duration !== 600) p.duration = c.duration;
  if (c.animation !== 'none' && c.stagger !== 70) p.stagger = c.stagger;
  if (c.order !== 'none') p.order = c.order;
  if (c.groupBy === 'none') p.groupBy = false;
  else if (c.groupBy !== 'default') p.groupBy = c.groupBy;
  if (c.search) p.search = true;
  if (c.filters) p.filters = true;
  if (c.jumpTo) p.jumpTo = true;
  if (c.expandable === 'single') p.expandable = 'single';
  if (c.expandable === 'off') p.expandable = false;
  if (c.trackActive) p.trackActive = true;
  if (c.scrollProgress) p.scrollProgress = true;
  if (c.pageSize > 0) p.pageSize = c.pageSize;
  for (const def of variantById[c.variant].options) {
    const value = c.options[def.key];
    if (value !== undefined && value !== def.default) p[def.key] = value;
  }
  return p;
}

/* ---- code generation ------------------------------------------------------------------------- */

const IDENT = /^[A-Za-z_$][\w$]*$/;

function quote(s: string) {
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
}

/** Serialises plain data as a readable JS literal. */
export function toLiteral(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const inner = '  '.repeat(indent + 1);
  if (typeof value === 'string') return quote(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null || value === undefined) return String(value);
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v !== 'object' || v === null)) {
      const flat = `[${value.map((v) => toLiteral(v)).join(', ')}]`;
      if (flat.length < 70) return flat;
    }
    return `[\n${value.map((v) => inner + toLiteral(v, indent + 1)).join(',\n')},\n${pad}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
    const parts = entries.map(([k, v]) => `${IDENT.test(k) ? k : quote(k)}: ${toLiteral(v, indent + 1)}`);
    const flat = `{ ${parts.join(', ')} }`;
    if (flat.length < 80 && !flat.includes('\n')) return flat;
    return `{\n${parts.map((p) => inner + p).join(',\n')},\n${pad}}`;
  }
  return 'undefined';
}

/** Replace inline data-URI artwork with readable placeholder paths in generated code. */
function cleanEvent(event: TimelineEvent): TimelineEvent {
  const out: TimelineEvent = { ...event };
  if (typeof out.image === 'string' && out.image.startsWith('data:')) out.image = `/logos/${event.id}.png`;
  else if (out.image && typeof out.image === 'object' && out.image.src.startsWith('data:'))
    out.image = { ...out.image, src: `/images/${event.id}.jpg` };
  return out;
}

function jsxProp(key: string, value: unknown): string {
  if (value === true) return key;
  if (typeof value === 'string') return `${key}=${JSON.stringify(value)}`;
  return `${key}={${toLiteral(value)}}`;
}

export interface CodegenOptions {
  style: 'unified' | 'component';
  fullData: boolean;
}

export function generateCode(c: PlaygroundConfig, events: TimelineEvent[], { style, fullData }: CodegenOptions): string {
  const info = variantById[c.variant];
  const props = buildProps(c);
  const shown = fullData ? events : events.slice(0, 3);
  const component = style === 'unified' ? 'Timeline' : info.component;

  const attrs: string[] = [];
  if (style === 'unified') attrs.push(`variant="${c.variant}"`);
  else if (c.variant === 'alternating') attrs.push('align="alternate"');
  attrs.push('events={events}');
  for (const [k, v] of Object.entries(props)) attrs.push(jsxProp(k, v));
  if (c.logEvents) attrs.push("onEventClick={(event) => console.log('Clicked', event.id)}");

  const lines = [
    `import { ${component}, type TimelineEvent } from 'm2timeline-motion';`,
    `import 'm2timeline-motion/styles.css';`,
    '',
    `const events: TimelineEvent[] = ${toLiteral(shown.map(cleanEvent))}${fullData || events.length <= 3 ? '' : ` // …${events.length - 3} more`};`,
    '',
    `export function ${pascal(c.dataset)}Timeline() {`,
    `  return (`,
    `    <${component}`,
    ...attrs.map((a) => `      ${a.replace(/\n/g, '\n      ')}`),
    `    />`,
    `  );`,
    `}`,
  ];
  return lines.join('\n') + '\n';
}

function pascal(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
