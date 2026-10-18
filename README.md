# m2timeline-motion

**Beautiful, accessible, motion-rich timelines and progress indicators for React.** Fourteen purpose-built timeline layouts and four progress components share one theme system and one motion system. Zero runtime dependencies, SSR-safe, tree-shakeable.

```bash
npm install m2timeline-motion
```

```tsx
import { Timeline } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

<Timeline events={events} variant="alternating" animation="reveal" />;
```

- **14 layouts with a clear job each.** Vertical, alternating, horizontal, roadmap, Gantt, career, history, changelog, story, minimal, cards, zigzag, stepper and activity feed, plus a custom layout API.
- **4 progress components.** `ProgressBar` has seven track styles (solid, segmented, dots, bars, slanted, chevron, outlined), statuses, tooltips, milestones and cancel. `SegmentedProgress` gives each segment its own status and tooltip. `StepProgress` handles checkouts and wizards, and `CircularProgress` draws rings and gauges.
- **Motion with restraint.** Seven scroll-reveal presets, staggered entrances, connector fill, pulsing current steps, gradient milestones and a scroll-linked progress line. It's all CSS on `transform`/`opacity`, and all of it respects `prefers-reduced-motion`.
- **Accessible by default.** Semantic lists and headings, real buttons with `aria-expanded`, arrow-key navigation, visible focus, status conveyed as text, and axe-core checks for every layout in CI.
- **SSR / Next.js ready.** Client boundaries (`'use client'`) are built in. Dates are deterministic (UTC). Time-relative text waits for hydration. Every layout is tested for hydration mismatches.
- **Designed to be themed.** Light/dark/auto themes, five appearances (`modern`, `minimal`, `glass`, `editorial`, `vibrant`), accent/gradient colors, density and radius, plus 40+ CSS custom properties.
- **TypeScript-first.** Variant-discriminated props, typed event `data`, controlled and uncontrolled state, render props and a headless `useTimeline` hook.

> Run the demo playground locally with `npm run dev`. It includes a gallery of every layout, a live configurator that generates copy-ready code, real-world recipes and full docs.

---

## Contents

- [Installation](#installation)
- [Layouts](#layouts)
- [Event data](#event-data)
- [Progress components](#progress-components)
- [Props](#props)
- [Theming & styling](#theming--styling)
- [Interactions](#interactions)
- [Custom layouts](#custom-layouts)
- [Next.js & SSR](#nextjs--ssr)
- [Accessibility](#accessibility)
- [Performance & bundle size](#performance--bundle-size)
- [Browser support](#browser-support)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

## Installation

```bash
npm install m2timeline-motion      # or: pnpm add / yarn add / bun add
```

You need React 18 or 19. Import the stylesheet **once**, for example in your entry file or root layout:

```ts
import 'm2timeline-motion/styles.css';
```

The package ships ESM and CommonJS builds, with declarations for both. It bundles no fonts or icon libraries: timelines inherit your app's font, and the few built-in icons are inline SVG.

## Layouts

Use `<Timeline variant="…">` for convenience, or import a layout component directly. Importing directly lets your bundler drop the layouts you don't use.

| `variant`     | Component                            | Best for                              | Layout-specific props                                                    |
| ------------- | ------------------------------------ | ------------------------------------- | ------------------------------------------------------------------------ |
| `vertical`    | `VerticalTimeline`                   | Company milestones, docs, about pages | `align` (`left`/`right`/`alternate`), `datePlacement`                    |
| `alternating` | `VerticalTimeline align="alternate"` | Histories, landing pages, portfolios  | `startSide`, `datePlacement`                                             |
| `horizontal`  | `HorizontalTimeline`                 | Release trains, hero sections         | `cardPosition`, `itemWidth`, `startAt`, `dragToScroll`, `showNavigation` |
| `roadmap`     | `RoadmapTimeline`                    | Public roadmaps, planning, OKRs       | `showOverview`, `laneWidth`                                              |
| `gantt`       | `GanttTimeline`                      | Project plans, delivery schedules     | `scale`, `today`, `labelWidth`, `minWidth`, `showPeople`                 |
| `career`      | `CareerTimeline`                     | Résumés, portfolios, team bios        | `showDuration`                                                           |
| `history`     | `HistoryTimeline`                    | Company history, museums, long reads  | `stickyLabels`                                                           |
| `changelog`   | `ChangelogTimeline`                  | Release notes, product updates        | `showBump`, `showLatest`                                                 |
| `story`       | `StoryTimeline`                      | Brand stories, case studies           | `mediaPosition`, `showNavigation`, `showProgress`                        |
| `minimal`     | `MinimalTimeline`                    | Professional sites, CVs               | —                                                                        |
| `cards`       | `CardTimeline`                       | Events, media-rich updates            | `minCardWidth`                                                           |
| `zigzag`      | `ZigzagTimeline`                     | Journeys, processes, infographics     | `columns`, `minColumnWidth`                                              |
| `stepper`     | `StepperTimeline`                    | Onboarding, order tracking, wizards   | `orientation`, `showSummary`                                             |
| `feed`        | `FeedTimeline`                       | Dashboards, audit logs, notifications | `relativeTime`                                                           |
| `custom`      | `CustomTimeline`                     | Anything else                         | `renderItem`, `listClassName`, `itemClassName`                           |

**Reverse chronological** order works with every layout: pass `order="desc"`.

For runtime layout switchers, type the variant as `LayoutVariant` (every variant except `custom`, which requires `renderItem`).

### Examples

```tsx
import { RoadmapTimeline, GanttTimeline, CareerTimeline, ChangelogTimeline, FeedTimeline } from 'm2timeline-motion';

<RoadmapTimeline events={roadmap} search filters />          // quarter lanes from dates, "Now" lane, overall progress
<GanttTimeline events={plan} today="2026-10-18" />           // `endDate` → bars, no `endDate` → milestones, `group` → phases
<CareerTimeline events={roles} />                             // consecutive roles with the same `group` nest under one company
<ChangelogTimeline events={releases} />                       // `version` + `changes`; Major/Minor/Patch detected automatically
<FeedTimeline events={activity} order="desc" pageSize={20} /> // day headings, relative times
```

Complete, copy-ready versions of these live in [`examples/`](./examples). Each one is type-checked and server-rendered against the packed npm tarball by `npm run smoke`.

## Event data

Only `id` and `title` are required. Every other field is optional and is rendered when present.

```ts
interface TimelineEvent<TData = unknown> {
  id: string | number;
  title: ReactNode;
  date?: string | number | Date; // "2024", "2024-03", "2024-03-18", ISO, Date; small integers are years (1969)
  endDate?: string | number | Date | 'present';
  dateLabel?: ReactNode; // override the formatted date
  subtitle?: ReactNode;
  location?: ReactNode;
  description?: ReactNode;
  details?: ReactNode; // makes the event expandable
  status?: 'completed' | 'current' | 'upcoming' | 'delayed' | 'blocked' | 'cancelled';
  progress?: number; // 0–100
  category?: string; // filter chips
  group?: string; // phases, companies, eras
  version?: string; // changelog
  changes?: { type: 'added' | 'changed' | 'improved' | 'fixed' | 'removed' | 'deprecated' | 'security' | 'breaking'; text: ReactNode }[];
  tags?: string[];
  icon?: ReactNode;
  image?: string | { src: string; alt: string; width?: number; height?: number; caption?: ReactNode };
  badges?: (string | { label: ReactNode; tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' })[];
  meta?: { label: ReactNode; value: ReactNode; icon?: ReactNode }[];
  people?: { name: string; avatar?: string; role?: string }[];
  links?: { label: ReactNode; href: string; external?: boolean }[];
  actions?: { label: ReactNode; onClick?(event, domEvent): void; href?: string; variant?: 'primary' | 'secondary' | 'ghost' }[];
  color?: string; // per-event accent
  highlight?: boolean; // special milestone: animated gradient border + glow
  disabled?: boolean;
  searchText?: string; // plain text for search when the title is JSX
  data?: TData; // your own typed payload
}
```

Invalid input never throws. Missing or duplicate ids, invalid dates, unknown statuses and out-of-range progress are repaired, and each problem is reported once as a development warning.

## Progress components

Four standalone components share the timeline theme tokens (`theme`, `tone`, `color`, `glow`, `animated`). Each is its own module.

```tsx
import { ProgressBar, SegmentedProgress, StepProgress, CircularProgress } from 'm2timeline-motion';

<ProgressBar label="Uploading…" info="Resumes automatically" value={45} status="loading" helperText="27MB of 60MB" onCancel={abort} />
<ProgressBar label="Upload Failed" value={100} status="error" valuePosition="none" helperText="Oops, something went wrong" />
<ProgressBar variant="segmented" segments={4} milestones={[25, 50, 75, 100]} value={38} />
<ProgressBar variant="chevron" value={40} color={['#ec4899', '#f9a8d4']} aria-label="Profile" />
<ProgressBar valuePosition="tooltip" value={30} max={150} formatValue={(v, m) => `${v}/${m} pts`} aria-label="Points" />

<SegmentedProgress label="Your Progress" segments={[
  { status: 'complete', label: 'V Therapy', description: 'Wed, Jan 16' },
  { status: 'scheduled', label: 'V Therapy', description: 'Wed, Jan 23' },
  { status: 'missed' }, { status: 'pending' }, { status: 'empty' },
]} />

<StepProgress steps={[{ label: 'Customer' }, { label: 'Shipping' }, { label: 'Payment' }]} current={1} pointer />
<StepProgress steps={steps} current={2} variant="dots" showTooltip hideLabels />
<CircularProgress value={70} sublabel="Grade Rating" />
<CircularProgress value={70} variant="gauge" arc={240} size="xl" color="#9b6cf6" />
```

| Component | Key props |
| --- | --- |
| `ProgressBar` | `value`, `max`, `label`, `info`, `helperText`, `status` (`loading`/`success`/`error`), `variant` (`solid`/`segmented`/`dots`/`bars`/`slanted`/`chevron`/`outlined`), `segments`, `valuePosition` (`top`/`start`/`end`/`inside`/`tooltip`/`none`), `formatValue`, `labelPosition`, `size` (`xs`–`xl`), `striped` (`true`/`'animated'`), `thumb`, `milestones`, `buffer`, `indeterminate`, `onCancel`, `start`/`end` |
| `SegmentedProgress` | `segments` (array of `{ status, label, description, tooltip, color }` or a count plus `value`), `label`, `formatCount`, `gap`, `size`, `onSegmentClick`, `statusLabels` |
| `StepProgress` | `steps` (`{ label, description, icon, status, tooltip }`), `current`, `variant` (`numbered`/`dots`/`icons`), `connectorProgress`, `showTooltip`, `pointer`, `hideLabels`, `onStepClick` |
| `CircularProgress` | `value`, `max`, `variant` (`circle`/`gauge`), `arc`, `size`, `thickness`, `label`, `sublabel`, `children`, `rounded`, `indeterminate` |

Accessibility:
- Bars and rings are `role="progressbar"` with value text, and `aria-busy` while loading. Success and error states are announced.
- Segments with tooltips become a labelled group of buttons whose tooltips show on hover and focus.
- Steps use an ordered list with `aria-current="step"`.
- Steps switch to a vertical layout in narrow containers.

## Props

These props are shared by every layout:

| Prop                                                                                 | Type                                                                                             | Default             | Notes                                             |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------- | ------------------------------------------------- |
| `events`                                                                             | `TimelineEvent[]`                                                                                | —                   | Safe to update at any time; new items animate in. |
| `theme`                                                                              | `'light' \| 'dark' \| 'auto'`                                                                    | `'auto'`            | `auto` follows `prefers-color-scheme`.            |
| `appearance`                                                                         | `'modern' \| 'minimal' \| 'glass' \| 'editorial' \| 'vibrant'`                                   | `'modern'`          |                                                   |
| `accent`                                                                             | `string \| [string, string]`                                                                     | theme               | A color or a gradient pair.                       |
| `density`                                                                            | `'compact' \| 'comfortable' \| 'spacious'`                                                       | `'comfortable'`     |                                                   |
| `radius`                                                                             | `number \| string`                                                                               | appearance          |                                                   |
| `marker`                                                                             | `'dot' \| 'ring' \| 'square' \| 'diamond' \| 'number' \| 'none'`                                 | `'dot'`             | Event `icon`s render inside markers.              |
| `connector`                                                                          | `'solid' \| 'dashed' \| 'dotted' \| 'gradient' \| 'none'`                                        | `'solid'`           |                                                   |
| `connectorAnimated`                                                                  | `boolean`                                                                                        | `false`             | Flowing dashes / travelling light.                |
| `glow`                                                                               | `boolean`                                                                                        | `true`              |                                                   |
| `animation`                                                                          | `'none' \| 'fade' \| 'rise' \| 'slide' \| 'scale' \| 'blur' \| 'reveal'`                         | `'rise'`            |                                                   |
| `duration` / `stagger`                                                               | `number` (ms)                                                                                    | `600` / `70`        |                                                   |
| `animateOnce`                                                                        | `boolean`                                                                                        | `true`              |                                                   |
| `scrollProgress`                                                                     | `boolean`                                                                                        | `false`             | The line fills as you scroll.                     |
| `order`                                                                              | `'none' \| 'asc' \| 'desc'`                                                                      | `'none'`            |                                                   |
| `groupBy`                                                                            | `false \| 'year' \| 'quarter' \| 'month' \| 'day' \| 'category' \| 'group' \| (item) => string` | per layout          |                                                   |
| `expandable`                                                                         | `boolean \| 'single'`                                                                            | `true`              |                                                   |
| `expandedIds` · `defaultExpandedIds` · `onExpandedChange`                            |                                                                                                  |                     | Controlled / uncontrolled.                        |
| `activeId` · `defaultActiveId` · `onActiveChange`                                    |                                                                                                  |                     | Controlled / uncontrolled.                        |
| `trackActive`                                                                        | `boolean`                                                                                        | `false`             | Scroll-spy.                                       |
| `autoScroll`                                                                         | `boolean`                                                                                        | `false`             | Scrolls the active event into view.               |
| `onEventClick`                                                                       | `(event, info) => void`                                                                          |                     |                                                   |
| `keyboardNavigation`                                                                 | `boolean`                                                                                        | `true`              | Arrow keys / Home / End.                          |
| `search` · `query` · `defaultQuery` · `onQueryChange`                                |                                                                                                  |                     | Built-in search.                                  |
| `filters` · `selectedCategories` · `defaultSelectedCategories` · `onCategoriesChange` |                                                                                                  |                     | Category chips.                                   |
| `jumpTo`                                                                             | `boolean`                                                                                        | `false`             | Buttons that jump to each group.                  |
| `pageSize`                                                                           | `number`                                                                                         |                     | Progressive "Show more".                          |
| `renderEvent` · `renderMarker` · `renderDate`                                        | `(event, ctx) => ReactNode`                                                                      |                     |                                                   |
| `formatDate` · `locale` · `timeZone`                                                 |                                                                                                  | `'en-US'` / `'UTC'` |                                                   |
| `labels`                                                                             | `Partial<TimelineLabels>`                                                                        | English             | Every UI string (i18n).                           |
| `emptyState` · `headingLevel` · `className` · `style` · `classNames` · `aria-label`  |                                                                                                  |                     |                                                   |

## Theming & styling

Every visual decision is a CSS custom property on `.m2t`:

```css
.m2t {
  --m2t-accent: #0ea5e9;
  --m2t-accent-2: #a855f7;
  --m2t-radius: 10px;
  --m2t-font: 'Inter', system-ui, sans-serif;
  --m2t-font-display: 'Fraunces', serif;
  --m2t-sticky-top: 72px; /* below your fixed header */
}
```

Key tokens:

- colors: `--m2t-surface*`, `--m2t-text*`, `--m2t-border*`, `--m2t-line`, `--m2t-success`, `--m2t-warning`, `--m2t-danger`, `--m2t-info`
- spacing: `--m2t-gap`, `--m2t-pad-y`, `--m2t-pad-x`
- shape: `--m2t-marker-size*`, `--m2t-line-width`, `--m2t-shadow*`
- motion: `--m2t-duration`, `--m2t-ease`

The class names (`.m2t-card`, `.m2t-marker`, `.m2t-title`, `.m2t-connector`, …) and data attributes (`[data-status]`, `[data-active]`, `[data-highlight]`, `[data-layout]`) are a stable, documented styling API. To attach utility classes (for example Tailwind) to internal parts, use `classNames={{ card: 'shadow-xl', title: 'text-lg' }}`.

If your app has its own theme toggle, pass its state: `theme={isDark ? 'dark' : 'light'}`.

## Interactions

```tsx
const [active, setActive] = useState<string | number | null>(null);

<VerticalTimeline
  events={events}
  activeId={active}
  onActiveChange={setActive}
  onEventClick={(event) => router.push(`/events/${event.id}`)}
  expandable="single"
  search
  filters
  jumpTo
  groupBy="year"
  trackActive
  scrollProgress
/>;
```

## Custom layouts

You can customize at three levels.

**1. Render props** work on any layout: `renderEvent`, `renderMarker`, `renderDate`.

**2. `CustomTimeline`** gives you ready-made parts and keeps every engine feature (ordering, search, expansion, motion, theming, keyboard support):

```tsx
<CustomTimeline
  events={sprints}
  listClassName="sprint-grid"
  renderItem={(item, { parts, isActive }) => (
    <div className={isActive ? 'sprint active' : 'sprint'}>
      {parts.marker} {parts.date} {parts.title}
    </div>
  )}
/>
```

**3. Headless.** Use the `useTimeline` hook with the `TimelineFrame`, `TimelineCard`, `TimelineMarker` and `itemAttrs` building blocks:

```tsx
const timeline = useTimeline({ events, order: 'desc' });
return (
  <TimelineFrame events={events} controller={timeline} layout="kanban" search>
    <ul>
      {timeline.visible.map((item, i) => (
        <li key={item.key} {...itemAttrs(item, i)}>
          <TimelineCard item={item} index={i} expanded={timeline.isExpanded(item.key)} />
        </li>
      ))}
    </ul>
  </TimelineFrame>
);
```

## Next.js & SSR

- Every component module starts with `'use client'`, so you can render timelines directly from **Server Components**. The pure helpers (`parseDate`, `sortItems`, `groupItems`, `detectBump`, …) carry no directive and stay server-callable.
- Props must be serializable when they cross from a Server Component. A timeline that needs callbacks or render functions should go inside your own `'use client'` wrapper. See [`examples/nextjs-app-router`](./examples/nextjs-app-router).
- Dates are parsed and formatted in **UTC with a fixed locale by default**, so server and client markup are identical. Relative times, "today" lines and ongoing durations render after hydration (via `useSyncExternalStore`). For the Gantt `today` line, pass `today` to render it on the server.
- Content is present in the server HTML. Entrance animations start once JavaScript is ready; if hydration never happens, a CSS failsafe reveals everything after 2.5 s. Without JavaScript, content is never hidden.

## Accessibility

- A labelled `<section>` region, ordered lists, real headings and `<time dateTime>`.
- Interactive events are `<button>`s with `aria-expanded`/`aria-controls`. Collapsed details are hidden from assistive tech.
- Arrow keys, Home and End move between events. Horizontal and Gantt views are keyboard-scrollable, and focus is always visible.
- Status is always rendered as text, never as color alone. Steppers expose `aria-current="step"`, and progress bars use `role="progressbar"`.
- `prefers-reduced-motion` disables entrance, pulse and connector animations. `forced-colors` mode is supported, and the default palettes target WCAG AA contrast.
- axe-core runs against every layout in the test suite.

## Performance & bundle size

- Zero runtime dependencies. React is a peer dependency.
- One IntersectionObserver per timeline writes visibility to DOM attributes, so **scrolling never re-renders React**. Scroll progress uses one passive, rAF-throttled listener, and only when enabled.
- Items are memoized, and search filtering runs through `useDeferredValue`. For very long timelines, use `pageSize`. Keep render callbacks stable with `useCallback`.
- Each layout is its own module (ESM, with `sideEffects` limited to CSS), so importing `VerticalTimeline` doesn't pull in the Gantt chart.

Measured by `npm run size` (minified + gzip, React external, budgets enforced in CI):

| Import                        | gzip     |
| ----------------------------- | -------- |
| `VerticalTimeline`            | ~10.8 kB |
| `GanttTimeline`               | ~9.8 kB  |
| `<Timeline>` (all 14 layouts) | ~18.2 kB |
| `ProgressBar`                 | ~2.2 kB  |
| All 4 progress components     | ~4.2 kB  |
| `parseDate` + `sortItems`     | ~0.6 kB  |
| `styles.css`                  | ~16 kB   |

## Browser support

All evergreen browsers: Chrome/Edge 111+, Safari 16.4+ and Firefox 113+. The styles use `color-mix()`, container queries, `:has()` and `subgrid`. Where a feature is missing, layouts degrade gracefully; for example, entrance animations are skipped where the `scripting` media feature is unsupported.

## Troubleshooting

| Symptom                                                    | Fix                                                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Unstyled output                                            | Import `m2timeline-motion/styles.css` once.                                                                         |
| _Functions cannot be passed directly to Client Components_ | Move timelines that use callbacks or render functions into a `'use client'` component.                              |
| Dates off by one day                                       | Date-only strings are UTC calendar dates and always format as written. For timestamps, pass `timeZone` or `formatDate`. |
| Sticky headings hidden under your header                   | Set `--m2t-sticky-top`.                                                                                             |
| Nothing animates                                           | Check `animation !== 'none'` and your OS reduced-motion setting, which is respected on purpose.                     |
| Search misses JSX titles                                   | Add `searchText`.                                                                                                   |

## Development

```bash
npm install
npm run dev          # demo playground
npm test             # unit, interaction, a11y (axe-core), SSR and hydration tests
npm run verify       # lint + typecheck + tests + build + publint/attw + size budgets + tarball smoke test
```

See [PUBLISHING.md](./PUBLISHING.md) for the release checklist and [CHANGELOG.md](./CHANGELOG.md) for the version history.

## License

[MIT](./LICENSE). The demo site loads Inter and JetBrains Mono from Google Fonts; the package itself bundles no fonts.
# m2Timeline-motion
