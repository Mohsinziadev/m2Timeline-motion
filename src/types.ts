import type { CSSProperties, MouseEvent, ReactNode } from 'react';

/* -------------------------------------------------------------------------------------------------
 * Event data
 * -----------------------------------------------------------------------------------------------*/

/**
 * Accepted date input.
 *
 * - `Date` instances
 * - ISO strings: `"2024"`, `"2024-03"`, `"2024-03-18"`, `"2024-03-18T10:30:00Z"`
 *   (date-only strings are parsed as UTC so server and client render identical output)
 * - numbers: integers between -9999 and 9999 are treated as **years** (handy for history timelines),
 *   anything else is treated as a millisecond timestamp.
 */
export type TimelineDateInput = string | number | Date;

/** Lifecycle state of an event. Drives marker icons, colors, connector fill and screen-reader text. */
export type TimelineStatus = 'completed' | 'current' | 'upcoming' | 'delayed' | 'blocked' | 'cancelled';

/** Semantic color tone used by badges and feed markers. */
export type TimelineTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export interface TimelineBadge {
  label: ReactNode;
  tone?: TimelineTone;
}

export interface TimelineMetaItem {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
}

export interface TimelinePerson {
  name: string;
  /** Image URL. When omitted, initials are rendered. */
  avatar?: string;
  role?: string;
}

export interface TimelineLink {
  label: ReactNode;
  href: string;
  /** Opens in a new tab with `rel="noopener noreferrer"`. Defaults to `true` for absolute http(s) URLs. */
  external?: boolean;
}

export interface TimelineAction<TData = unknown> {
  label: ReactNode;
  onClick?(event: TimelineEvent<TData>, domEvent: MouseEvent<HTMLElement>): void;
  /** Renders the action as a link instead of a button. */
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
  /** Accessible label, required when `label` is not text (e.g. icon only). */
  ariaLabel?: string;
}

export type TimelineChangeType = 'added' | 'changed' | 'improved' | 'fixed' | 'removed' | 'deprecated' | 'security' | 'breaking';

export interface TimelineChange {
  type: TimelineChangeType;
  text: ReactNode;
}

export interface TimelineMedia {
  src: string;
  /** Alternative text. Use `""` for purely decorative images. */
  alt: string;
  width?: number;
  height?: number;
  caption?: ReactNode;
}

/**
 * A single timeline entry. Only `id` and `title` are required; every other field is optional and is
 * rendered when present. Layouts use the fields that make sense for them (e.g. `version` and
 * `changes` in the changelog, `people` and `endDate` in the Gantt chart).
 */
export interface TimelineEvent<TData = unknown> {
  /** Stable unique identifier. Used for keys, expansion and active state. */
  id: string | number;
  title: ReactNode;
  /** Start date (or the date of a point-in-time event). */
  date?: TimelineDateInput;
  /** End date for ranges, or `"present"` for ongoing items (career roles, running projects). */
  endDate?: TimelineDateInput | 'present';
  /** Overrides the formatted date text. */
  dateLabel?: ReactNode;
  subtitle?: ReactNode;
  location?: ReactNode;
  description?: ReactNode;
  /** Extra content revealed when the event is expanded. Makes the event expandable. */
  details?: ReactNode;
  status?: TimelineStatus;
  /** Completion percentage, 0–100. Values outside the range are clamped. */
  progress?: number;
  /** Used by the built-in category filter. */
  category?: string;
  /** Logical group (company, phase, era...). Used by `groupBy="group"` and several layouts. */
  group?: string;
  /** Release version, e.g. `"2.4.0"`. Used by the changelog layout to detect major/minor/patch bumps. */
  version?: string;
  tags?: string[];
  icon?: ReactNode;
  image?: TimelineMedia | string;
  badges?: Array<TimelineBadge | string>;
  meta?: TimelineMetaItem[];
  people?: TimelinePerson[];
  changes?: TimelineChange[];
  links?: TimelineLink[];
  actions?: TimelineAction<TData>[];
  /** Per-event accent color (any CSS color). */
  color?: string;
  /** Marks a special milestone with an accent glow / gradient border. */
  highlight?: boolean;
  /** Prevents selection and expansion. */
  disabled?: boolean;
  /** Plain-text content used by search when `title`/`description` are React elements. */
  searchText?: string;
  /** Arbitrary user data, passed through to render callbacks. */
  data?: TData;
}

/* -------------------------------------------------------------------------------------------------
 * Resolved items (engine output)
 * -----------------------------------------------------------------------------------------------*/

export type DatePrecision = 'year' | 'month' | 'day' | 'time';

export interface ParsedDate {
  /** Milliseconds since epoch (UTC). */
  time: number;
  date: Date;
  precision: DatePrecision;
}

/** An event after validation, date parsing, sorting and filtering. */
export interface TimelineItem<TData = unknown> {
  /** Stable string key derived from `event.id`. */
  key: string;
  event: TimelineEvent<TData>;
  /** Position in the ordered (unfiltered) list. */
  index: number;
  start: ParsedDate | null;
  end: ParsedDate | null;
  /** `true` when `endDate === "present"`. */
  ongoing: boolean;
  status: TimelineStatus | undefined;
  /** Clamped 0–100, or `undefined`. */
  progress: number | undefined;
  /** Lower-cased text used for searching. */
  searchText: string;
}

export interface TimelineGroup<TData = unknown> {
  key: string;
  label: string;
  items: TimelineItem<TData>[];
}

/* -------------------------------------------------------------------------------------------------
 * Configuration
 * -----------------------------------------------------------------------------------------------*/

export type TimelineTheme = 'light' | 'dark' | 'auto';
export type TimelineAppearance = 'modern' | 'minimal' | 'glass' | 'editorial' | 'vibrant';
export type TimelineDensity = 'compact' | 'comfortable' | 'spacious';
export type TimelineMarkerShape = 'dot' | 'ring' | 'square' | 'diamond' | 'number' | 'none';
export type TimelineConnectorStyle = 'solid' | 'dashed' | 'dotted' | 'gradient' | 'none';
export type TimelineAnimation = 'none' | 'fade' | 'rise' | 'slide' | 'scale' | 'blur' | 'reveal';
export type TimelineOrder = 'none' | 'asc' | 'desc';

export type TimelineGroupBy<TData = unknown> =
  false | 'year' | 'quarter' | 'month' | 'day' | 'category' | 'group' | ((item: TimelineItem<TData>) => string | null | undefined);

export type TimelineSlot = 'root' | 'toolbar' | 'list' | 'item' | 'marker' | 'connector' | 'card' | 'title' | 'date' | 'group' | 'empty';

export interface TimelineLabels {
  region: string;
  search: string;
  searchPlaceholder: string;
  filterBy: string;
  allCategories: string;
  jumpTo: string;
  clearFilters: string;
  empty: string;
  noResults: string;
  expand: string;
  collapse: string;
  previous: string;
  next: string;
  present: string;
  today: string;
  yesterday: string;
  latest: string;
  now: string;
  location: string;
  chapters: string;
  opensInNewTab: string;
  showMore: (remaining: number) => string;
  results: (shown: number, total: number) => string;
  roles: (count: number) => string;
  step: (current: number, total: number) => string;
  duration: (years: number, months: number) => string;
  complete: (percent: number) => string;
  status: Record<TimelineStatus, string>;
  changeTypes: Record<TimelineChangeType, string>;
  versionBump: Record<'major' | 'minor' | 'patch' | 'prerelease', string>;
}

export interface TimelineSearchOptions {
  placeholder?: string;
  label?: string;
}

export interface TimelineFilterOptions {
  /** Restrict / order the categories offered. Defaults to every category found in the data. */
  categories?: string[];
  label?: string;
}

/** Information passed to render callbacks. */
export interface TimelineRenderContext<TData = unknown> {
  item: TimelineItem<TData>;
  /** Position within the currently displayed (filtered) list. */
  index: number;
  total: number;
  isActive: boolean;
  isExpanded: boolean;
  isFirst: boolean;
  isLast: boolean;
  toggle: () => void;
  select: () => void;
  /** Pre-formatted date text (respects `dateLabel`, `formatDate`, `locale`). */
  dateText: string;
}

export interface TimelineClickInfo<TData = unknown> {
  item: TimelineItem<TData>;
  index: number;
  domEvent: MouseEvent<HTMLElement>;
}

/** Props shared by every layout. */
export interface TimelineCommonProps<TData = unknown> {
  /** The events to render. Safe to update at any time — new items animate in. */
  events: ReadonlyArray<TimelineEvent<TData>>;

  /* ---- look & feel ---- */
  /** Color scheme. `auto` follows `prefers-color-scheme`. @default 'auto' */
  theme?: TimelineTheme;
  /** Visual style preset. @default 'modern' */
  appearance?: TimelineAppearance;
  /** Accent color, or a `[from, to]` pair for gradients. */
  accent?: string | [string, string];
  /** Spacing scale. @default 'comfortable' */
  density?: TimelineDensity;
  /** Corner radius for cards (number = px). */
  radius?: number | string;
  /** Marker shape. Events with an `icon` render it inside the marker. @default 'dot' */
  marker?: TimelineMarkerShape;
  /** Connector line style. @default 'solid' */
  connector?: TimelineConnectorStyle;
  /** Animates the connector (flowing dashes / travelling light). @default false */
  connectorAnimated?: boolean;
  /** Glow on current & highlighted milestones. @default true */
  glow?: boolean;

  /* ---- motion ---- */
  /** Entrance animation preset. Automatically disabled with `prefers-reduced-motion`. @default 'rise' */
  animation?: TimelineAnimation;
  /** Animation duration in ms. @default 600 */
  duration?: number;
  /** Delay between items that enter the viewport together, in ms. @default 70 */
  stagger?: number;
  /** Only animate the first time an item enters the viewport. @default true */
  animateOnce?: boolean;
  /** Fill the connector up to the current item as you scroll. @default false */
  scrollProgress?: boolean;

  /* ---- data ---- */
  /** Sort by date. `none` keeps the input order. @default 'none' */
  order?: TimelineOrder;
  /** Group items under headings. Each layout has a sensible default. */
  groupBy?: TimelineGroupBy<TData>;

  /* ---- interaction ---- */
  /** Allow events with `details` to expand. `'single'` keeps one open at a time. @default true */
  expandable?: boolean | 'single';
  expandedIds?: ReadonlyArray<string | number>;
  defaultExpandedIds?: ReadonlyArray<string | number>;
  onExpandedChange?: (ids: Array<string | number>) => void;
  activeId?: string | number | null;
  defaultActiveId?: string | number | null;
  onActiveChange?: (id: string | number | null, event: TimelineEvent<TData> | null) => void;
  /** Mark the event in the middle of the viewport as active while scrolling. @default false */
  trackActive?: boolean;
  /** Scroll the active event into view when `activeId` changes. @default false */
  autoScroll?: boolean;
  /** Called when an event is clicked or activated with the keyboard. */
  onEventClick?: (event: TimelineEvent<TData>, info: TimelineClickInfo<TData>) => void;
  /** Arrow / Home / End keys move focus between events. @default true */
  keyboardNavigation?: boolean;

  /* ---- toolbar ---- */
  /** Show a search field. */
  search?: boolean | TimelineSearchOptions;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Show category filter chips (uses `event.category`). */
  filters?: boolean | TimelineFilterOptions;
  selectedCategories?: ReadonlyArray<string>;
  defaultSelectedCategories?: ReadonlyArray<string>;
  onCategoriesChange?: (categories: string[]) => void;
  /** Show a "jump to" menu listing the groups (years, quarters, phases...). */
  jumpTo?: boolean;
  /** Render this many items, then a "Show more" button. Useful for very long timelines. */
  pageSize?: number;

  /* ---- rendering ---- */
  /** Replace the default card body. */
  renderEvent?: (event: TimelineEvent<TData>, ctx: TimelineRenderContext<TData>) => ReactNode;
  /** Replace the default marker. */
  renderMarker?: (event: TimelineEvent<TData>, ctx: TimelineRenderContext<TData>) => ReactNode;
  /** Replace the default date text. */
  renderDate?: (event: TimelineEvent<TData>, ctx: TimelineRenderContext<TData>) => ReactNode;
  /** Custom date formatter. Receives the parsed UTC date and its precision. */
  formatDate?: (date: Date, precision: DatePrecision, event: TimelineEvent<TData>) => string;
  /** BCP-47 locale for built-in date formatting. @default 'en-US' */
  locale?: string;
  /** IANA time zone for date formatting. @default 'UTC' (deterministic across server and client) */
  timeZone?: string;
  /** Content shown when there are no events. */
  emptyState?: ReactNode;
  /** Override any UI string (i18n). */
  labels?: Partial<TimelineLabels>;
  /** Heading level for event titles. @default 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;

  /* ---- DOM ---- */
  id?: string;
  className?: string;
  style?: CSSProperties;
  /** Extra class names for internal parts. */
  classNames?: Partial<Record<TimelineSlot, string>>;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}
