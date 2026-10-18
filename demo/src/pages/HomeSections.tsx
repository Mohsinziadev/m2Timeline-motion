import {
  CircularProgress,
  ProgressBar,
  SegmentedProgress,
  StepProgress,
  Timeline,
  type LayoutVariant,
  type TimelineProps,
} from 'm2timeline-motion';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import headlessCode from '../../../examples/headless.tsx?raw';
import quickstartCode from '../../../examples/quickstart.tsx?raw';
import { sharedProps } from '../api-data';
import { ApiTable } from '../components/ApiReference';
import { InstallPanel } from '../components/docs-ui';
import { previewEvents, snippet } from '../layout-preview';
import { Playground } from '../components/Playground';
import { CodeBlock } from '../components/ui';
import { Icon } from '../icons';
import { PKG, SIZES } from '../meta';
import { CATEGORIES, variantById, variantInfo, type Category } from '../variants';

type Theme = 'light' | 'dark';
const NPM_URL = `https://www.npmjs.com/package/${PKG.name}`;

function SectionHead({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <header className="lp-head">
      <p className="lp-eyebrow">{eyebrow}</p>
      <h2 id={id} className="lp-title">
        {title}
      </h2>
      <p className="lp-lead">{children}</p>
    </header>
  );
}

/* ---- hero ---------------------------------------------------------------------------------- */

const HERO_LAYOUTS: LayoutVariant[] = ['stepper', 'vertical', 'roadmap'];

function Hero({ theme, onCustomize }: { theme: Theme; onCustomize: (v: LayoutVariant) => void }) {
  const [tab, setTab] = useState<LayoutVariant>('stepper');
  const v = variantById[tab];
  return (
    <section id="top" className="lp-hero" aria-labelledby="phero-title">
      <div className="lp-hero__copy">
        <h1 id="phero-title" className="lp-hero__title">
          Timelines, designed <span>for real interfaces.</span>
        </h1>
        <p className="lp-hero__lead">
          Accessible, motion-rich React timelines and progress bars. {variantInfo.length} layouts — from a simple vertical line to roadmaps,
          Gantt charts and changelogs — on one data model, with zero dependencies.
        </p>
        <InstallPanel />
        <div className="lp-hero__actions">
          <a className="btn btn--dark" href="#playground">
            Open the playground
          </a>
          <a className="btn btn--secondary" href={NPM_URL}>
            View on npm
          </a>
        </div>
        <p className="lp-facts">
          <span>
            <b>{PKG.dependencies}</b> runtime dependencies
          </span>
          <span>
            <b>{variantInfo.length}</b> layouts
          </span>
          <span>
            <b>≈ {SIZES[0].value}</b> per layout
          </span>
          <span>
            <b>TypeScript</b> · ESM + CJS · SSR
          </span>
        </p>
      </div>

      <div className="lp-demo">
        <div className="lp-demo__bar">
          <div className="seg seg--sm" role="tablist" aria-label="Example layout">
            {HERO_LAYOUTS.map((id) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} className="seg__btn" onClick={() => setTab(id)}>
                {variantById[id].name}
              </button>
            ))}
          </div>
        </div>
        <div className="lp-demo__stage" role="tabpanel" aria-label={`${v.name} timeline, live`}>
          <Timeline
            key={tab}
            {...({ variant: tab, events: previewEvents(v), theme, density: 'compact', ...v.galleryProps } as TimelineProps)}
          />
        </div>
        <div className="lp-demo__foot">
          <span className="lp-dot" aria-hidden="true" />
          Live component · {v.scenario}
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => onCustomize(tab)}>
            Customize
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---- layouts: one at a time ------------------------------------------------------------------ */

function LayoutBrowser({ theme, onCustomize }: { theme: Theme; onCustomize: (v: LayoutVariant) => void }) {
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [selected, setSelected] = useState<LayoutVariant>('vertical');
  const [mode, setMode] = useState<'preview' | 'code'>('preview');
  const list = variantInfo.filter((v) => category === 'All' || v.categories.includes(category));
  const v = variantById[selected];
  const code = useMemo(() => (mode === 'code' ? snippet(v) : ''), [mode, v]);
  const tag = `<${v.component}${v.id === 'alternating' ? ' align="alternate"' : ''} />`;

  // Links such as #layout-gantt (search, docs tables) select that layout.
  useEffect(() => {
    const pick = () => {
      const m = window.location.hash.match(/^#layout-([\w-]+)/);
      if (m && m[1] in variantById) {
        setCategory('All');
        setSelected(m[1] as LayoutVariant);
      }
    };
    pick();
    window.addEventListener('hashchange', pick);
    return () => window.removeEventListener('hashchange', pick);
  }, []);

  return (
    <section id="layouts" className="lp-sec" aria-labelledby="layouts-h">
      <SectionHead id="layouts-h" eyebrow="Layouts" title={`${variantInfo.length} layouts, one data model`}>
        Every layout reads the same events, so switching is one prop. Pick a layout to see it live, read its code, or open it in the
        playground.
      </SectionHead>
      <div className="chips" role="group" aria-label="Filter layouts by category">
        <button type="button" className="chip2" aria-pressed={category === 'All'} onClick={() => setCategory('All')}>
          All <span>{variantInfo.length}</span>
        </button>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className="chip2" aria-pressed={category === c} onClick={() => setCategory(c)}>
            {c} <span>{variantInfo.filter((x) => x.categories.includes(c)).length}</span>
          </button>
        ))}
      </div>
      <div className="lb">
        <ul className="lb__list" aria-label="Layouts">
          {list.map((x) => (
            <li key={x.id}>
              <button
                id={`layout-${x.id}`}
                type="button"
                className="lb__item"
                aria-current={x.id === selected ? 'true' : undefined}
                onClick={() => {
                  setSelected(x.id);
                  setMode('preview');
                }}
              >
                <span className="lb__name">{x.name}</span>
                <span className="lb__cat">{x.categories[0]}</span>
              </button>
            </li>
          ))}
        </ul>
        <article className="lb__panel" aria-labelledby="lb-name">
          <header className="lb__head">
            <div className="lb__titles">
              <h3 id="lb-name" className="lb__title">
                {v.name} <code>{tag}</code>
              </h3>
              <p className="lb__tagline">{v.tagline}</p>
              <p className="lb__use">
                <b>Best for</b> {v.useFor}
              </p>
            </div>
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => onCustomize(v.id)}>
              <Icon name="sliders" size={14} /> Customize in playground
            </button>
          </header>
          <div className="lb__toolbar">
            <div className="seg seg--sm" role="radiogroup" aria-label="Show">
              {(['preview', 'code'] as const).map((m) => (
                <button key={m} type="button" role="radio" aria-checked={mode === m} className="seg__btn" onClick={() => setMode(m)}>
                  {m === 'preview' ? 'Preview' : 'Code'}
                </button>
              ))}
            </div>
            <span className="lb__scenario">
              <Icon name="layers" size={13} /> {v.scenario}
            </span>
          </div>
          <div className="lb__stage">
            {mode === 'preview' ? (
              <Timeline key={v.id} {...({ variant: v.id, events: previewEvents(v), theme, ...v.galleryProps } as TimelineProps)} />
            ) : (
              <CodeBlock code={code} title={`${v.component}.tsx`} maxHeight={460} />
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

/* ---- progress components ------------------------------------------------------------------- */

function ProgressShowcase({ theme }: { theme: Theme }) {
  const cards: Array<{ name: string; title: string; node: ReactNode }> = [
    { name: 'ProgressBar', title: 'Progress bar', node: <ProgressBar theme={theme} label="Uploading assets" value={64} /> },
    {
      name: 'StepProgress',
      title: 'Stepper',
      node: (
        <StepProgress
          theme={theme}
          steps={[{ label: 'Cart' }, { label: 'Shipping' }, { label: 'Payment' }, { label: 'Done' }]}
          current={1}
        />
      ),
    },
    { name: 'SegmentedProgress', title: 'Segmented', node: <SegmentedProgress theme={theme} segments={10} value={6} label="Chunks" /> },
    { name: 'CircularProgress', title: 'Gauge', node: <CircularProgress theme={theme} value={70} sublabel="Score" tone="success" /> },
  ];
  return (
    <section id="progress-components" className="lp-sec" aria-labelledby="progress-h">
      <SectionHead id="progress-h" eyebrow="Progress" title="Bars, steppers and gauges in the same theme">
        Four progress components for uploads, onboarding, checkout and scores — accessible, animated and themed like the timelines.
      </SectionHead>
      <ul className="lp-progress">
        {cards.map((c) => (
          <li key={c.name} className="lp-progress__card">
            <div className="lp-progress__demo">{c.node}</div>
            <p className="lp-progress__title">
              {c.title} <code>{`<${c.name} />`}</code>
            </p>
          </li>
        ))}
      </ul>
      <a className="lp-more" href="#/progress">
        Explore the progress components <Icon name="arrow" size={14} />
      </a>
    </section>
  );
}

/* ---- quick start ------------------------------------------------------------------------------ */

const SINGLE = `import { VerticalTimeline, type TimelineEvent } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css'; // once, anywhere in your app

export function Releases({ events }: { events: TimelineEvent[] }) {
  return <VerticalTimeline events={events} animation="rise" />;
}`;

const WAYS = [
  {
    title: 'One component',
    body: '<Timeline variant="…"> switches layouts with the same data.',
    code: quickstartCode,
    file: 'QuickStart.tsx',
  },
  { title: 'A single layout', body: `Import only the layout you use — about ${SIZES[0].value} gzip.`, code: SINGLE, file: 'Releases.tsx' },
  {
    title: 'Headless',
    body: 'useTimeline gives you ordering, search and keyboard support for your own markup.',
    code: headlessCode,
    file: 'Headless.tsx',
  },
];

function QuickStart() {
  const [way, setWay] = useState(0);
  return (
    <section id="start" className="lp-sec" aria-labelledby="start-h">
      <SectionHead id="start-h" eyebrow="Quick start" title="Three ways in">
        Import the stylesheet once. Built for React 18 or 19, and ready for the Next.js App Router.
      </SectionHead>
      <div className="lp-ways">
        <div className="lp-ways__side">
          <div className="lp-ways__list" role="tablist" aria-label="Ways to use the package">
            {WAYS.map((w, i) => (
              <button key={w.title} type="button" role="tab" aria-selected={way === i} className="lp-way" onClick={() => setWay(i)}>
                <span className="lp-way__n">0{i + 1}</span>
                <span>
                  <span className="lp-way__title">{w.title}</span>
                  <span className="lp-way__body">{w.body}</span>
                </span>
              </button>
            ))}
          </div>
          <ul className="lp-checks">
            <li>
              <b>Server Components ready.</b> Every component module carries a <code>'use client'</code> directive; the pure helpers stay
              server-safe.
            </li>
            <li>
              <b>Your look.</b> Theme with props or CSS variables such as <code>--m2t-accent</code> and <code>--m2t-radius</code>.
            </li>
          </ul>
        </div>
        <div role="tabpanel" className="lp-ways__code">
          <CodeBlock code={WAYS[way].code} title={WAYS[way].file} maxHeight={520} />
        </div>
      </div>
    </section>
  );
}

/* ---- accessibility ------------------------------------------------------------------------- */

function Accessibility() {
  const keys: Array<[string, string]> = [
    ['Tab', 'Moves between interactive events and controls — every event is a real button.'],
    ['↑ ↓ ← →', 'Move focus between events.'],
    ['Home / End', 'Jump to the first or last event.'],
    ['Enter / Space', 'Expand or collapse an event’s details.'],
  ];
  return (
    <section id="a11y" className="lp-sec" aria-labelledby="a11y-h">
      <SectionHead id="a11y-h" eyebrow="Accessibility" title="Keyboards, screen readers and calm motion">
        Real structure and real controls, not decorative markup — and motion that steps aside when the system asks for less.
      </SectionHead>
      <div className="lp-a11y">
        <div className="api-table" role="region" aria-label="Keyboard support" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th scope="col">Key</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(([k, a]) => (
                <tr key={k}>
                  <td>
                    <kbd className="lp-kbd">{k}</kbd>
                  </td>
                  <td>{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="lp-checks">
          <li>
            <b>Real structure.</b> A labelled region, ordered lists, real headings and <code>&lt;time dateTime&gt;</code> elements.
          </li>
          <li>
            <b>Not colour alone.</b> Status is always conveyed as text as well as colour; steppers expose <code>aria-current="step"</code>.
          </li>
          <li>
            <b>Reduced motion.</b> Entrance animations and connector fills respect <code>prefers-reduced-motion</code> automatically.
          </li>
          <li>
            <b>Tested.</b> Every layout is checked with axe-core in the package’s test suite.
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ---- props at a glance ----------------------------------------------------------------------- */

function PropsGlance() {
  return (
    <section id="api" className="lp-sec" aria-labelledby="api-h">
      <SectionHead id="api-h" eyebrow="API" title="Props at a glance">
        Every prop is typed. The documentation has the full reference — layout props, callbacks, event data, hooks and CSS variables.
      </SectionHead>
      <ApiTable rows={sharedProps.slice(0, 12)} label="Shared props" />
      <a className="lp-more" href="#/docs/api-props">
        Full API reference <Icon name="arrow" size={14} />
      </a>
    </section>
  );
}

/* ---- page ------------------------------------------------------------------------------------ */

export function Home({
  theme,
  request,
  onCustomize,
}: {
  theme: Theme;
  request: { variant: LayoutVariant; nonce: number } | null;
  onCustomize: (v: LayoutVariant) => void;
}) {
  return (
    <div className="lp">
      <Hero theme={theme} onCustomize={onCustomize} />
      <section id="playground" className="lp-sec" aria-labelledby="playground-h">
        <SectionHead id="playground-h" eyebrow="Playground" title="Tune it live, copy the code">
          Every control maps to a real prop on the real component. Edit the events in the Data tab, then copy a snippet that matches what
          you see.
        </SectionHead>
        <Playground request={request} siteTheme={theme} />
      </section>
      <LayoutBrowser theme={theme} onCustomize={onCustomize} />
      <ProgressShowcase theme={theme} />
      <QuickStart />
      <Accessibility />
      <PropsGlance />
    </div>
  );
}
