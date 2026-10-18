import type { LayoutVariant } from 'm2timeline-motion';
import { Timeline } from 'm2timeline-motion';
import { useState, type CSSProperties, type ReactNode } from 'react';
import changelog from '../../../CHANGELOG.md?raw';
import customCode from '../../../examples/custom-layout.tsx?raw';
import headlessCode from '../../../examples/headless.tsx?raw';
import nextPage from '../../../examples/nextjs-app-router/app/page.tsx?raw';
import nextClient from '../../../examples/nextjs-app-router/app/release-timeline.tsx?raw';
import quickstartCode from '../../../examples/quickstart.tsx?raw';
import { callbackProps, cssVars, eventFields, hooksAndUtils, layoutProps, sharedProps } from '../api-data';
import { ApiTable } from '../components/ApiReference';
import { Callout, InstallPanel, MiniMarkdown } from '../components/docs-ui';
import { Examples } from '../components/Examples';
import { LayoutGallery } from '../components/LayoutGallery';
import { Playground } from '../components/Playground';
import { CodeBlock } from '../components/ui';
import { Icon } from '../icons';
import { NAV } from '../docs-nav';
import { PACKAGES_URL, PKG, RELATED, SIZES } from '../meta';
import { variantInfo } from '../variants';
import { datasets } from '../data';
import type { View } from '../router';

const IMPORTS = `import { Timeline } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';`;

const BASIC = `import { VerticalTimeline, type TimelineEvent } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

const deploys: TimelineEvent[] = [
  { id: 'build', title: 'Production build', date: '2026-10-18T09:12:00Z', status: 'completed' },
  { id: 'staging', title: 'Deploy to staging', date: '2026-10-18T09:20:00Z', status: 'current', progress: 64 },
  { id: 'prod', title: 'Promote to production', status: 'upcoming', details: 'Requires one approval.' },
];

export function DeployTimeline() {
  return (
    <VerticalTimeline
      events={deploys}
      onEventClick={(event) => console.log('Selected', event.id)}
    />
  );
}`;

const THEMING = `/* All timelines */
.m2t {
  --m2t-accent: #6d5bd0;
  --m2t-radius: 10px;
  --m2t-font: 'Inter', system-ui, sans-serif;
  --m2t-sticky-top: 64px; /* below your fixed header */
}

/* One timeline: <VerticalTimeline className="release-notes" … /> */
.release-notes .m2t-card {
  border-width: 2px;
}`;

const PROPS_THEME = `<RoadmapTimeline
  events={roadmap}
  theme="dark"
  appearance="minimal"
  accent={['#6d5bd0', '#3b82f6']}
  density="compact"
  marker="ring"
  connector="dashed"
/>`;

const ANIMATION = `<VerticalTimeline
  events={events}
  animation="blur"        // none | fade | rise | slide | scale | blur | reveal
  duration={500}
  stagger={90}
  scrollProgress          // line fills as you scroll
  connectorAnimated       // travelling light along the line
/>`;

const TYPES = `import type { TimelineEvent, TimelineProps, LayoutVariant } from 'm2timeline-motion';

type Release = { downloads: number };

const releases: TimelineEvent<Release>[] = [
  { id: '1.2.0', title: 'Search', version: '1.2.0', data: { downloads: 1840 } },
];

// Every layout except "custom" (which requires renderItem) — handy for switchers.
const layout: LayoutVariant = 'changelog';`;

/** "On this page" for wide screens: the sections of the group currently being read. */
function OnThisPage({ active }: { active: string | null }) {
  const group = NAV.find((g) => g.items.some((i) => i.id === active)) ?? NAV[0];
  return (
    <aside className="otp" aria-label="On this page">
      <p className="otp__title">On this page</p>
      <p className="otp__group">{group.label}</p>
      <ul>
        {group.items
          .filter((i) => !i.href)
          .map((i) => (
            <li key={i.id}>
              <a href={`#${i.id}`} aria-current={i.id === active ? 'location' : undefined}>
                {i.label}
              </a>
            </li>
          ))}
      </ul>
      <a className="otp__top" href="#overview">
        Scroll to top <Icon name="arrow" size={14} />
      </a>
    </aside>
  );
}

function Section({ id, title, eyebrow, children }: { id: string; title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section id={id} className="doc2" aria-labelledby={`${id}-h`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={`${id}-h`} className="doc2__title">
        <a href={`#${id}`} className="doc2__anchor" aria-label={`Link to ${title}`}>
          #
        </a>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** The six things the package does, in the reader's words (facts from package.json and the docs below). */
const FEATURES: Array<{ icon: Parameters<typeof Icon>[0]['name']; title: string; body: string; href?: string }> = [
  {
    icon: 'layers',
    title: '14 timeline layouts',
    body: 'From a classic vertical line to Gantt charts, roadmaps, changelogs and activity feeds — all from the same event data.',
    href: '#/components',
  },
  {
    icon: 'bar',
    title: 'Progress components',
    body: 'Progress bars, segmented progress, steppers and gauges that share the timelines’ theme.',
    href: '#/progress',
  },
  {
    icon: 'motion',
    title: 'Motion that respects users',
    body: 'Seven entrance animations, scroll progress and animated connectors. Reduced-motion settings are honoured automatically.',
  },
  {
    icon: 'check',
    title: 'Accessible by default',
    body: 'Real components with keyboard support, visible focus states and screen-reader text — not static mockups.',
  },
  {
    icon: 'server',
    title: 'SSR & App Router ready',
    body: 'Deterministic server rendering, and every component module carries a ‘use client’ directive for Next.js.',
  },
  {
    icon: 'package',
    title: 'Zero dependencies',
    body: 'Tree-shakeable ESM and CJS with TypeScript types. One layout is about 10.8 kB gzip.',
  },
];

const EXPLORE: Array<{ href: string; icon: Parameters<typeof Icon>[0]['name']; title: string; body: string; cta: string }> = [
  {
    href: '#/components',
    icon: 'layers',
    title: 'Components',
    body: `Browse all ${variantInfo.length} layouts with live previews and their code.`,
    cta: 'Browse layouts',
  },
  {
    href: '#/playground',
    icon: 'sliders',
    title: 'Playground',
    body: 'Tune every prop, edit the data and copy the generated code.',
    cta: 'Open playground',
  },
  {
    href: '#/docs',
    icon: 'book',
    title: 'Documentation',
    body: 'Guides, theming, accessibility, SSR and the full API reference.',
    cta: 'Read the docs',
  },
];

function Overview({ theme }: { theme: 'light' | 'dark' }) {
  // A short, real timeline for the hero: the first steps of the CI/CD sample.
  const preview = datasets.pipeline.slice(0, 4);
  return (
    <>
      <section id="overview" className="ov-hero" aria-labelledby="phero-title">
        <div className="ov-hero__copy">
          <div className="ov-hero__pills">
            <span className="pill pill--live">
              <span className="pill__dot" aria-hidden="true" />
              Live, interactive examples
            </span>
            <span className="pill">React · TypeScript</span>
            <span className="pill">v{PKG.version}</span>
            <span className="pill">{PKG.license}</span>
          </div>
          <h1 id="phero-title" className="ov-hero__title">
            Timelines, designed for <span>real interfaces.</span>
          </h1>
          <p className="ov-hero__lead">
            {variantInfo.length} production-ready timeline layouts and four progress components for React — accessible, motion-rich and
            themeable, with zero dependencies.
          </p>
          <InstallPanel />
          <div className="ov-hero__actions">
            <a className="btn btn--primary" href="#/components">
              Browse {variantInfo.length} layouts <Icon name="arrow" size={15} />
            </a>
            <a className="btn btn--secondary" href="#/playground">
              Open playground
            </a>
            <a className="btn btn--ghost" href="#/docs">
              Documentation
            </a>
          </div>
        </div>
        <div className="ov-hero__demo" aria-label="Live example: a deployment pipeline timeline">
          <div className="ov-window">
            <div className="ov-window__bar" aria-hidden="true">
              <span />
              <span />
              <span />
              <code>{'<VerticalTimeline events={pipeline} />'}</code>
            </div>
            <div className="ov-window__body">
              <Timeline variant="vertical" events={preview} theme={theme} density="compact" animation="none" expandable={false} />
            </div>
          </div>
        </div>
      </section>

      <dl className="ov-facts">
        {[
          ['Version', PKG.version],
          ['License', PKG.license],
          [
            'Peer dependency',
            `React ${PKG.react
              .replace(/\^/g, '')
              .replace(/\.0\.0/g, '')
              .replace(/\s*\|\|\s*/g, ' or ')}`,
          ],
          ['Runtime dependencies', String(PKG.dependencies)],
          ['One layout', `≈ ${SIZES[0].value} gzip`],
          ['Formats', 'ESM · CJS · .d.ts'],
        ].map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <section className="ov-sec" aria-labelledby="ov-features">
        <header className="ov-sec__head">
          <p className="eyebrow">Why m2timeline-motion</p>
          <h2 id="ov-features" className="ov-sec__title">
            Everything a timeline needs, nothing it doesn’t
          </h2>
        </header>
        <ul className="ov-features">
          {FEATURES.map((f) => (
            <li key={f.title} className="ov-feature">
              <span className="ov-feature__icon" aria-hidden="true">
                <Icon name={f.icon} size={18} />
              </span>
              <h3 className="ov-feature__title">{f.href ? <a href={f.href}>{f.title}</a> : f.title}</h3>
              <p className="ov-feature__body">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="ov-sec" aria-labelledby="ov-start">
        <header className="ov-sec__head">
          <p className="eyebrow">Quick start</p>
          <h2 id="ov-start" className="ov-sec__title">
            Up and running in three steps
          </h2>
        </header>
        <ol className="ov-steps">
          <li className="ov-step">
            <span className="ov-step__n" aria-hidden="true">
              1
            </span>
            <div className="ov-step__body">
              <h3 className="ov-step__title">Install</h3>
              <p className="ov-step__text">React 18 or 19 is the only peer dependency.</p>
              <InstallPanel compact />
            </div>
          </li>
          <li className="ov-step">
            <span className="ov-step__n" aria-hidden="true">
              2
            </span>
            <div className="ov-step__body">
              <h3 className="ov-step__title">Import a layout and the stylesheet</h3>
              <p className="ov-step__text">Import the CSS once, in your entry file or root layout.</p>
              <CodeBlock code={IMPORTS} title="main.tsx" />
            </div>
          </li>
          <li className="ov-step">
            <span className="ov-step__n" aria-hidden="true">
              3
            </span>
            <div className="ov-step__body">
              <h3 className="ov-step__title">Render it with your events</h3>
              <p className="ov-step__text">
                Only <code>id</code> and <code>title</code> are required on each event.
              </p>
              <CodeBlock code={quickstartCode} title="QuickStart.tsx" maxHeight={300} />
            </div>
          </li>
        </ol>
      </section>

      <section className="ov-sec" aria-labelledby="ov-explore">
        <header className="ov-sec__head">
          <p className="eyebrow">Explore</p>
          <h2 id="ov-explore" className="ov-sec__title">
            Where to next
          </h2>
        </header>
        <ul className="ov-explore">
          {EXPLORE.map((e) => (
            <li key={e.href}>
              <a className="ov-card" href={e.href}>
                <span className="ov-card__icon" aria-hidden="true">
                  <Icon name={e.icon} size={20} />
                </span>
                <span className="ov-card__title">{e.title}</span>
                <span className="ov-card__body">{e.body}</span>
                <span className="ov-card__cta">
                  {e.cta} <Icon name="arrow" size={14} />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="ov-related">
          <p className="ov-related__title">More from M2Toolkit</p>
          <ul>
            {RELATED.map((p) => (
              <li key={p.slug}>
                <a href={p.url} style={{ '--rel': p.accent } as CSSProperties}>
                  <span className="related__dot" aria-hidden="true" />
                  {p.title}
                </a>
              </li>
            ))}
            <li>
              <a href={PACKAGES_URL} className="ov-related__all">
                All packages <Icon name="external" size={13} />
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}

export function PackagePage({ theme, active, view }: { theme: 'light' | 'dark'; active: string | null; view: View }) {
  const [request, setRequest] = useState<{ variant: LayoutVariant; nonce: number } | null>(null);

  // "Customize" on a layout card loads it into the playground view.
  const customize = (variant: LayoutVariant) => {
    setRequest({ variant, nonce: Date.now() });
    window.location.hash = '#/playground';
  };

  return (
    <>
      {/* Every view stays in the HTML (hidden when inactive) so the whole page is readable without JavaScript and by search engines. */}
      <div className="pview" data-view="overview" hidden={view !== 'overview'}>
        <Overview theme={theme} />
      </div>

      <div className="pview" data-view="components" hidden={view !== 'components'}>
        <section id="gallery" className="psec psec--view" aria-labelledby="gallery-h">
          <header className="vhead">
            <div>
              <p className="eyebrow">Components</p>
              <h2 id="gallery-h" className="vhead__title">
                {variantInfo.length} timeline layouts
              </h2>
            </div>
            <p className="vhead__lead">
              Every card renders the real component with sample data. Flip a card to <strong>Code</strong>, or press{' '}
              <strong>Customize</strong> to open it in the playground.
            </p>
          </header>
          <LayoutGallery theme={theme} onCustomize={customize} />
        </section>
      </div>

      <div className="pview" data-view="playground" hidden={view !== 'playground'}>
        <section id="playground" className="psec psec--view" aria-labelledby="playground-h">
          <header className="vhead">
            <div>
              <p className="eyebrow">Playground</p>
              <h2 id="playground-h" className="vhead__title" tabIndex={-1}>
                Configure, preview, copy
              </h2>
            </div>
            <p className="vhead__lead">Every control is a real prop. The preview and the generated code stay in sync.</p>
          </header>
          <Playground request={request} />
        </section>
      </div>

      <div className="pview" data-view="docs" hidden={view !== 'docs'}>
        {/* ---- documentation ----------------------------------------------------------------- */}
        <div className="docs2">
          <OnThisPage active={active} />
          <div className="docs2__content">
            <Section id="docs-introduction" eyebrow="Documentation" title="Introduction">
              <p>
                <code>{PKG.name}</code> is a library of timeline components for React. Every layout reads the same{' '}
                <code>TimelineEvent</code> data, shares one theme and motion system, and works without a stylesheet framework. Alongside the
                14 timeline layouts, the package ships four progress components —{' '}
                <a href="#/progress">progress bars, segmented progress, steppers and gauges</a>.
              </p>
              <ul className="doc2__list">
                <li>Real components with keyboard support, focus states and screen-reader text, not static mockups.</li>
                <li>Entrance animations and connector fills are CSS transitions that respect reduced-motion settings.</li>
                <li>Server rendering is deterministic, so the same markup comes from the server and the browser.</li>
              </ul>
            </Section>

            <Section id="docs-install" title="Installation">
              <p>
                Install the package with your package manager. React is a peer dependency (React 18 or 19); there are no other runtime
                dependencies.
              </p>
              <InstallPanel compact />
              <p>Import the stylesheet once — in your entry file or root layout — then import any layout:</p>
              <CodeBlock code={IMPORTS} title="main.tsx" />
              <Callout title="Unstyled output?">
                The components ship their styles as a single CSS file. If a timeline renders as plain lists, the{' '}
                <code>m2timeline-motion/styles.css</code> import is missing.
              </Callout>
            </Section>

            <Section id="docs-quickstart" title="Quick start">
              <p>
                The smallest complete example. Change the <code>variant</code> to switch layouts with the same data.
              </p>
              <CodeBlock code={quickstartCode} title="QuickStart.tsx" />
            </Section>

            <Section id="docs-usage" title="Basic usage">
              <p>
                Import a layout component directly so your bundler can leave the others out, give it events, and react to interaction
                through callbacks. Only <code>id</code> and <code>title</code> are required on each event.
              </p>
              <CodeBlock code={BASIC} title="DeployTimeline.tsx" />
              <Callout tone="info" title="One component or many">
                <code>{'<Timeline variant="…">'}</code> is convenient for switchers and playgrounds; it includes every layout (≈ 18.2 kB
                gzip). Importing a single layout such as <code>VerticalTimeline</code> keeps it to ≈ 10.8 kB.
              </Callout>
            </Section>

            <Section id="docs-layouts" title="Choosing a layout">
              <p>Every layout is its own component. The gallery above shows each one live; this table summarizes what they are for.</p>
              <div className="api-table" role="region" aria-label="Layouts" tabIndex={0}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Component</th>
                      <th scope="col">variant</th>
                      <th scope="col">Best for</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantInfo.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <a href={`#layout-${v.id}`}>
                            <code className="api-name">{v.component}</code>
                          </a>
                          {v.id === 'alternating' && <code className="api-type"> align="alternate"</code>}
                        </td>
                        <td>
                          <code className="api-type">{v.id}</code>
                        </td>
                        <td>{v.useFor}</td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <code className="api-name">CustomTimeline</code>
                      </td>
                      <td>
                        <code className="api-type">custom</code>
                      </td>
                      <td>Your own markup with the engine’s ordering, search, motion and keyboard support</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                Reverse chronological order works with every layout: pass <code>order="desc"</code>.
              </p>
            </Section>

            <Section id="docs-theming" title="Customization & theming">
              <p>
                Start with props: <code>theme</code>, <code>appearance</code> (<code>modern</code>, <code>minimal</code>, <code>glass</code>
                , <code>editorial</code>, <code>vibrant</code>), <code>accent</code>, <code>density</code>, <code>marker</code> and{' '}
                <code>connector</code>.
              </p>
              <CodeBlock code={PROPS_THEME} title="Roadmap.tsx" />
              <p>
                For anything else, every visual decision is a CSS custom property on <code>.m2t</code>:
              </p>
              <CodeBlock code={THEMING} title="styles.css" />
              <p>
                Stable class names (<code>.m2t-card</code>, <code>.m2t-marker</code>, <code>.m2t-title</code>…) and data attributes (
                <code>[data-status]</code>, <code>[data-active]</code>) are part of the public API. Use the <code>classNames</code> prop to
                attach utility classes to internal parts. To replace rendering, use <code>renderEvent</code>, <code>renderMarker</code> or{' '}
                <code>renderDate</code>, <code>CustomTimeline</code>, or the headless useTimeline hook:
              </p>
              <CodeBlock code={customCode} title="SprintBoard.tsx" />
              <CodeBlock code={headlessCode} title="Headless.tsx" />
            </Section>

            <Section id="docs-animation" title="Animation & transitions">
              <p>
                Items reveal as they enter the viewport using one IntersectionObserver per timeline; scrolling never re-renders React.
                Presets animate only <code>opacity</code>, <code>transform</code>, <code>filter</code> and <code>clip-path</code>.
              </p>
              <CodeBlock code={ANIMATION} title="Animated.tsx" />
              <Callout title="Reduced motion is respected">
                With <code>prefers-reduced-motion: reduce</code>, entrance animations, pulses and connector effects are switched off
                automatically. Pass <code>animation="none"</code> to disable them for everyone.
              </Callout>
            </Section>

            <Section id="docs-typescript" title="TypeScript">
              <p>
                The package is written in TypeScript and ships TypeScript declarations for ESM and CommonJS. Props are discriminated by{' '}
                <code>variant</code>, so each layout’s own options autocomplete, and <code>TimelineEvent&lt;TData&gt;</code> carries your
                own typed <code>data</code> through to render callbacks.
              </p>
              <CodeBlock code={TYPES} title="types.ts" />
            </Section>

            <Section id="docs-a11y" title="Accessibility">
              <ul className="doc2__list">
                <li>
                  A labelled region, ordered lists, real headings and <code>&lt;time dateTime&gt;</code> elements.
                </li>
                <li>
                  Interactive events are buttons with <code>aria-expanded</code> and <code>aria-controls</code>; collapsed details are
                  hidden from assistive technology.
                </li>
                <li>Arrow keys, Home and End move focus between events; horizontal and Gantt views scroll with the keyboard.</li>
                <li>
                  Status is always conveyed as text as well as colour. Steppers expose <code>aria-current="step"</code>.
                </li>
                <li>Every layout is checked with axe-core in the package’s test suite.</li>
              </ul>
            </Section>

            <Section id="docs-compat" title="Frameworks & SSR">
              <p>
                Built for React 18 or 19. Works with the Next.js App Router: every component module carries a <code>'use client'</code>{' '}
                directive, so you can render timelines from Server Components, while the pure helpers stay server-safe. Dates are formatted
                in UTC by default, and time-relative output (“3 hours ago”, today lines) renders after hydration, so server and client
                markup match.
              </p>
              <CodeBlock code={nextPage} title="app/page.tsx" />
              <CodeBlock code={nextClient} title="app/release-timeline.tsx" />
              <Callout tone="warning" title="Functions can’t cross the server boundary">
                Callbacks such as <code>onEventClick</code> and render functions must be passed from a client component. Wrap those
                timelines in a file that starts with <code>'use client'</code>, as above.
              </Callout>
            </Section>

            <Section id="docs-examples" title="Examples & recipes">
              <p>
                Complete, copy-ready recipes. Each one is type-checked and server-rendered against the packed package in the release checks.
              </p>
              <Examples theme={theme} />
            </Section>

            {/* ---- API ------------------------------------------------------------------------- */}
            <Section id="api-props" eyebrow="API reference" title="Shared props">
              <p>
                Accepted by every layout component and by <code>{'<Timeline>'}</code>.
              </p>
              <ApiTable rows={sharedProps} label="Shared props" />
            </Section>
            <Section id="api-callbacks" title="Callbacks">
              <ApiTable rows={callbackProps} label="Callbacks" />
            </Section>
            <Section id="api-events" title="Event data">
              <p>
                The <code>TimelineEvent</code> shape. Invalid input never throws: missing or duplicate ids, invalid dates and out-of-range
                progress are repaired and reported once as development warnings.
              </p>
              <ApiTable rows={eventFields} label="Event fields" first="Field" />
            </Section>
            <Section id="api-layouts" title="Layout props">
              <p>Options specific to one layout, in addition to the shared props.</p>
              <div className="api-table" role="region" aria-label="Layout props" tabIndex={0}>
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Component</th>
                      <th scope="col">Prop</th>
                      <th scope="col">Type</th>
                      <th scope="col">Default</th>
                      <th scope="col">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {layoutProps.map(([component, prop, type, def, desc]) => (
                      <tr key={`${component}-${prop}`}>
                        <td>
                          <code className="api-type">{component}</code>
                        </td>
                        <td>
                          <code className="api-name">{prop}</code>
                        </td>
                        <td>
                          <code className="api-type">{type}</code>
                        </td>
                        <td>
                          <code className="api-def">{def}</code>
                        </td>
                        <td>{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
            <Section id="api-hooks" title="Hooks & utilities">
              <ApiTable rows={hooksAndUtils} label="Hooks and utilities" first="Export" />
            </Section>
            <Section id="api-css" title="CSS variables">
              <ApiTable rows={cssVars} label="CSS variables" first="Variable" />
            </Section>

            {/* ---- help ------------------------------------------------------------------------ */}
            <Section id="docs-troubleshooting" eyebrow="Help" title="Troubleshooting">
              <dl className="faq2">
                <dt>The timeline renders unstyled.</dt>
                <dd>
                  Import <code>m2timeline-motion/styles.css</code> once in your app.
                </dd>
                <dt>“Functions cannot be passed directly to Client Components”.</dt>
                <dd>
                  A callback was passed from a Server Component. Move that timeline into a file with <code>'use client'</code>.
                </dd>
                <dt>Dates are off by one day.</dt>
                <dd>
                  Date-only strings are UTC calendar dates and format as written. For timestamps, pass <code>timeZone</code> or a custom{' '}
                  <code>formatDate</code>.
                </dd>
                <dt>Sticky headings hide behind my header.</dt>
                <dd>
                  Set <code>--m2t-sticky-top</code> to your header height.
                </dd>
                <dt>Search doesn’t find events with JSX titles.</dt>
                <dd>
                  Add a plain-text <code>searchText</code> to those events.
                </dd>
              </dl>
            </Section>

            <Section id="docs-faq" title="FAQ">
              <dl className="faq2">
                <dt>Does it work without the stylesheet framework I use?</dt>
                <dd>
                  Yes. The package ships plain CSS scoped to its own class names, so it sits next to Tailwind, CSS Modules or anything else.
                </dd>
                <dt>How do I keep bundles small?</dt>
                <dd>
                  Import layouts individually. Each layout is its own module and the package marks only CSS as having side effects. Measured
                  sizes are listed under <a href="#package">Package information</a>.
                </dd>
                <dt>Can I use my own markup?</dt>
                <dd>
                  Yes — use <code>renderEvent</code> for the card body, <code>CustomTimeline</code> for whole items, or the headless
                  useTimeline hook for full control.
                </dd>
                <dt>Is it ready for very long timelines?</dt>
                <dd>
                  Items are memoised and search runs at a lower priority while you type. For hundreds of events, render in pages with{' '}
                  <code>pageSize</code>.
                </dd>
              </dl>
            </Section>

            <Section id="docs-changelog" title="Changelog">
              <div className="changelog2">
                <MiniMarkdown source={changelog} />
              </div>
            </Section>

            {/* ---- package information --------------------------------------------------------- */}
            <Section id="package" eyebrow="Package" title="Package information">
              <div className="pinfo">
                <div className="pinfo__card">
                  <p className="pinfo__head">Install</p>
                  <InstallPanel compact />
                  <dl className="pinfo__list">
                    <div>
                      <dt>Package</dt>
                      <dd>
                        <code>{PKG.name}</code>
                      </dd>
                    </div>
                    <div>
                      <dt>Version</dt>
                      <dd>{PKG.version}</dd>
                    </div>
                    <div>
                      <dt>License</dt>
                      <dd>{PKG.license}</dd>
                    </div>
                    <div>
                      <dt>Peer dependencies</dt>
                      <dd>
                        <code>react</code>, <code>react-dom</code> {PKG.react}
                      </dd>
                    </div>
                    <div>
                      <dt>Runtime dependencies</dt>
                      <dd>{PKG.dependencies}</dd>
                    </div>
                    <div>
                      <dt>Formats</dt>
                      <dd>ESM, CommonJS, TypeScript declarations, one CSS file</dd>
                    </div>
                    <div>
                      <dt>Source repository</dt>
                      <dd className="pinfo__missing">Not public yet</dd>
                    </div>
                  </dl>
                </div>
                <div className="pinfo__card">
                  <p className="pinfo__head">Bundle size</p>
                  <dl className="pinfo__list">
                    {SIZES.map((s) => (
                      <div key={s.label}>
                        <dt>{s.label}</dt>
                        <dd>{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="pinfo__note">Minified and gzipped with React external, measured by the package’s size check.</p>
                </div>
                <div className="pinfo__card pinfo__card--wide">
                  <p className="pinfo__head">More from M2Toolkit</p>
                  <ul className="related">
                    {RELATED.map((p) => (
                      <li key={p.slug}>
                        <a className="related__item" href={p.url} style={{ '--rel': p.accent } as CSSProperties}>
                          <span className="related__dot" aria-hidden="true" />
                          <span className="related__text">
                            <span className="related__title">{p.title}</span>
                            <span className="related__tag">{p.tagline}</span>
                          </span>
                          <Icon name="arrow" size={15} />
                        </a>
                      </li>
                    ))}
                  </ul>
                  <a className="pinfo__all" href={PACKAGES_URL}>
                    Browse all npm packages on M2Toolkit <Icon name="external" size={14} />
                  </a>
                </div>
              </div>
            </Section>

            <nav className="pager" aria-label="Continue reading">
              <a className="pager__item" href="#playground">
                <Icon name="arrowLeft" size={16} />
                <span>
                  <span className="pager__hint">Previous</span>
                  <span className="pager__label">Playground</span>
                </span>
              </a>
              <a className="pager__item pager__item--next" href="#/progress">
                <span>
                  <span className="pager__hint">Next</span>
                  <span className="pager__label">Progress components</span>
                </span>
                <Icon name="arrow" size={16} />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
