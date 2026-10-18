import { variantInfo } from './variants';

export interface NavItem {
  id: string;
  label: string;
  /** Route link instead of an in-page anchor. */
  href?: string;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Every section of the package page, in reading order. Sidebar, search and prev/next use this. */
export const NAV: NavGroup[] = [
  {
    label: 'Getting started',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'docs-introduction', label: 'Introduction' },
      { id: 'docs-install', label: 'Installation' },
      { id: 'docs-quickstart', label: 'Quick start' },
    ],
  },
  {
    label: 'Components',
    items: [
      { id: 'gallery', label: 'Layout gallery' },
      { id: 'playground', label: 'Playground' },
      { id: 'progress-link', label: 'Progress components', href: '#/progress' },
    ],
  },
  {
    label: 'Guides',
    items: [
      { id: 'docs-usage', label: 'Basic usage' },
      { id: 'docs-layouts', label: 'Choosing a layout' },
      { id: 'docs-theming', label: 'Customization & theming' },
      { id: 'docs-animation', label: 'Animation & transitions' },
      { id: 'docs-typescript', label: 'TypeScript' },
      { id: 'docs-a11y', label: 'Accessibility' },
      { id: 'docs-compat', label: 'Frameworks & SSR' },
      { id: 'docs-examples', label: 'Examples & recipes' },
    ],
  },
  {
    label: 'API reference',
    items: [
      { id: 'api-props', label: 'Shared props' },
      { id: 'api-callbacks', label: 'Callbacks' },
      { id: 'api-events', label: 'Event data' },
      { id: 'api-layouts', label: 'Layout props' },
      { id: 'api-hooks', label: 'Hooks & utilities' },
      { id: 'api-css', label: 'CSS variables' },
    ],
  },
  {
    label: 'Help',
    items: [
      { id: 'docs-troubleshooting', label: 'Troubleshooting' },
      { id: 'docs-faq', label: 'FAQ' },
      { id: 'docs-changelog', label: 'Changelog' },
      { id: 'package', label: 'Package information' },
    ],
  },
];

/** In-page section ids for the scroll spy. */
export const SECTION_IDS = NAV.flatMap((g) => g.items.filter((i) => !i.href).map((i) => i.id));

export interface SearchEntry {
  label: string;
  group: string;
  target: string;
  keywords: string;
}

/** Everything the docs search can jump to: sections, the 14 layouts and their components. */
export const SEARCH_INDEX: SearchEntry[] = [
  ...NAV.flatMap((g) =>
    g.items.map((i) => ({ label: i.label, group: g.label, target: i.href ?? `#${i.id}`, keywords: `${i.label} ${g.label}`.toLowerCase() })),
  ),
  ...variantInfo.map((v) => ({
    label: v.name,
    group: 'Layouts',
    target: `#layout-${v.id}`,
    keywords: `${v.name} ${v.component} ${v.tagline} ${v.useFor} ${v.scenario} ${v.categories.join(' ')}`.toLowerCase(),
  })),
];
