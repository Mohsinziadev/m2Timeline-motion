import {
  CircularProgress,
  ProgressBar,
  SegmentedProgress,
  StepProgress,
  type ProgressSegment,
  type TimelineTheme,
} from 'm2timeline-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CodeBlock } from '../components/ui';
import { Tile } from '../icons';
import { ProgressPlayground } from '../components/ProgressPlayground';

type SiteTheme = 'light' | 'dark';

function Showcase({
  id,
  eyebrow,
  title,
  lead,
  code,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  code?: string;
  children: ReactNode;
}) {
  return (
    <section className="pshow" id={id} aria-labelledby={`${id}-title`}>
      <header className="pshow__head">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`}>{title}</h2>
        <p className="section__lead">{lead}</p>
      </header>
      {children}
      {code && (
        <details className="pshow__code">
          <summary>Show code</summary>
          <CodeBlock code={code} title="Example.tsx" />
        </details>
      )}
    </section>
  );
}

/* ---- 1. upload & status (light + dark panels) ----------------------------------------------- */

function StatusStack({ theme }: { theme: TimelineTheme }) {
  return (
    <div className="pstack">
      <ProgressBar
        theme={theme}
        label="Uploading…"
        info="Files upload in the background"
        value={45}
        status="loading"
        helperText="27MB of 60MB"
      />
      <ProgressBar theme={theme} label="Upload Complete" info="Stored securely" value={100} status="success" helperText="60MB of 60MB" />
      <ProgressBar
        theme={theme}
        label="Upload Failed"
        info="Network interrupted"
        value={100}
        status="error"
        valuePosition="none"
        helperText="Oops, something went wrong"
      />
      <ProgressBar theme={theme} label="Class A" value={368} max={460} tone="success" formatValue={(v) => v} />
      <ProgressBar theme={theme} label="Class B" value={211} max={352} color="#f97352" formatValue={(v) => v} />
      <ProgressBar theme={theme} label="Class C" value={96} max={480} tone="danger" formatValue={(v) => v} />
      <ProgressBar
        theme={theme}
        label={
          <>
            design-system.fig <span className="muted-inline">(23.6MB)</span>
          </>
        }
        value={50}
        tone="contrast"
        formatValue={(_, __, p) => <span className="muted-inline">{p}% (9 sec left)</span>}
        onCancel={() => {}}
      />
      <ProgressBar
        theme={theme}
        label="Please wait…"
        value={70}
        tone="contrast"
        formatValue={(_, __, p) => <span className="muted-inline">{p}%</span>}
      />
      <ProgressBar
        theme={theme}
        label="Progress"
        info="Syncing workspace"
        labelPosition="start"
        valuePosition="end"
        value={50}
        status="loading"
      />
      <ProgressBar theme={theme} aria-label="Export" value={50} tone="info" formatValue={(_, __, p) => `${p}% Complete`} />
      <ProgressBar theme={theme} aria-label="Download" value={50} color="#fbbf24" valuePosition="start" onCancel={() => {}} />
      <ProgressBar
        theme={theme}
        aria-label="Backup"
        value={58}
        color="#ec4fd3"
        valuePosition="none"
        helperText="(650MB/1.12GB) · 17 seconds remaining"
      />
    </div>
  );
}

/* ---- 2. track styles -------------------------------------------------------------------------- */

function StyleCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="pcard">
      <p className="pcard__title">{title}</p>
      <div className="pcard__body">{children}</div>
    </div>
  );
}

/* ---- 3. appointments (segments with tooltips) ------------------------------------------------- */

const therapy = (status: ProgressSegment['status']): ProgressSegment => ({ status, label: 'V Therapy', description: 'Wed, Jan 16' });
const plan = (overrides: Record<number, ProgressSegment['status']>, base: ProgressSegment['status'][] = []) =>
  Array.from({ length: 12 }, (_, i) => therapy(overrides[i] ?? base[i] ?? 'empty'));
const recommended = plan({}, [
  'empty',
  'pending',
  'empty',
  'pending',
  'empty',
  'pending',
  'empty',
  'pending',
  'empty',
  'pending',
  'empty',
  'pending',
]);
const inProgress = plan({
  0: 'complete',
  1: 'complete',
  2: 'complete',
  4: 'scheduled',
  5: 'scheduled',
  7: 'pending',
  9: 'pending',
  11: 'pending',
});
const complete = plan({
  0: 'complete',
  1: 'complete',
  2: 'complete',
  4: 'complete',
  5: 'complete',
  7: 'complete',
  9: 'complete',
  11: 'complete',
});
const missed = plan({
  0: 'complete',
  1: 'complete',
  2: 'complete',
  4: 'missed',
  5: 'missed',
  7: 'complete',
  9: 'complete',
  11: 'complete',
});

/* ---- 6. live simulation --------------------------------------------------------------------- */

type SimState = 'idle' | 'running' | 'paused' | 'done' | 'failed';

function useSimulation() {
  const [value, setValue] = useState(0);
  const [state, setState] = useState<SimState>('idle');
  const valueRef = useRef(0);
  useEffect(() => {
    if (state !== 'running') return;
    const timer = setInterval(() => {
      const next = Math.min(100, valueRef.current + 1 + Math.random() * 4);
      valueRef.current = next;
      setValue(next);
      if (next >= 100) setState('done');
    }, 180);
    return () => clearInterval(timer);
  }, [state]);
  const set = (v: number) => {
    valueRef.current = v;
    setValue(v);
  };
  return {
    value,
    state,
    start: () => {
      if (state === 'done' || state === 'failed') set(0);
      setState('running');
    },
    pause: () => setState('paused'),
    fail: () => setState('failed'),
    reset: () => {
      set(0);
      setState('idle');
    },
  };
}

function LiveDemo({ theme }: { theme: SiteTheme }) {
  const sim = useSimulation();
  const status = sim.state === 'running' ? 'loading' : sim.state === 'done' ? 'success' : sim.state === 'failed' ? 'error' : 'default';
  const mb = ((sim.value / 100) * 84.2).toFixed(1);
  const steps = [{ label: 'Upload' }, { label: 'Scan' }, { label: 'Process' }, { label: 'Publish' }];
  const stepIndex = sim.state === 'done' ? 4 : Math.min(3, Math.floor(sim.value / 25));
  return (
    <div className="plive">
      <div className="plive__panel">
        <ProgressBar
          theme={theme}
          label="quarterly-report.pdf"
          info="Uploads resume automatically"
          value={sim.value}
          status={status}
          size="lg"
          glow={sim.state === 'running'}
          striped={sim.state === 'running' ? 'animated' : false}
          helperText={
            sim.state === 'failed'
              ? 'Upload failed — check your connection and retry'
              : sim.state === 'done'
                ? '84.2MB uploaded'
                : `${mb}MB of 84.2MB`
          }
          onCancel={sim.state === 'running' || sim.state === 'paused' ? sim.reset : undefined}
        />
        <StepProgress theme={theme} steps={steps} current={stepIndex} connectorProgress={(sim.value % 25) / 25} variant="dots" />
        <div className="plive__actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={sim.start} disabled={sim.state === 'running'}>
            {sim.state === 'paused' ? 'Resume' : sim.state === 'done' || sim.state === 'failed' ? 'Restart' : 'Start upload'}
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={sim.pause} disabled={sim.state !== 'running'}>
            Pause
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={sim.fail}
            disabled={sim.state !== 'running' && sim.state !== 'paused'}
          >
            Simulate error
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={sim.reset}>
            Reset
          </button>
        </div>
      </div>
      <div className="plive__side">
        <CircularProgress
          theme={theme}
          value={sim.value}
          size="lg"
          sublabel="Uploaded"
          tone={status === 'error' ? 'danger' : status === 'success' ? 'success' : 'accent'}
        />
        <SegmentedProgress theme={theme} segments={10} value={Math.floor(sim.value / 10)} label="Chunks" />
      </div>
    </div>
  );
}

/* ---- page ------------------------------------------------------------------------------------ */

const codeStatus = `<ProgressBar label="Uploading…" info="Files upload in the background" value={45} status="loading" helperText="27MB of 60MB" />
<ProgressBar label="Upload Complete" value={100} status="success" helperText="60MB of 60MB" />
<ProgressBar label="Upload Failed" value={100} status="error" valuePosition="none" helperText="Oops, something went wrong" />
<ProgressBar label="design-system.fig" value={50} tone="contrast" onCancel={cancel} />
<ProgressBar label="Progress" labelPosition="start" valuePosition="end" value={50} status="loading" />
<ProgressBar aria-label="Download" value={50} color="#fbbf24" valuePosition="start" onCancel={cancel} />`;

const codeStyles = `<ProgressBar variant="segmented" segments={4} value={40} />
<ProgressBar thumb value={52} color="#db2777" />
<ProgressBar milestones={[25, 50, 75, 100]} variant="segmented" value={38} />
<ProgressBar variant="dots" value={45} />
<ProgressBar variant="bars" value={74} />
<ProgressBar variant="slanted" value={86} />
<ProgressBar variant="chevron" value={40} />
<ProgressBar variant="outlined" valuePosition="inside" value={52} />
<ProgressBar striped="animated" value={64} size="lg" />
<ProgressBar indeterminate label="Connecting…" />
<ProgressBar value={35} buffer={70} />
<ProgressBar valuePosition="tooltip" value={78} />`;

const codeSegments = `const sessions: ProgressSegment[] = [
  { status: 'complete', label: 'V Therapy', description: 'Wed, Jan 16' },
  { status: 'scheduled', label: 'V Therapy', description: 'Wed, Jan 23' },
  { status: 'missed', label: 'V Therapy', description: 'Wed, Jan 30' },
  { status: 'pending', label: 'V Therapy', description: 'Wed, Feb 6' },
  { status: 'empty' },
];

<SegmentedProgress label="Your Progress" segments={sessions} />`;

const codeSteps = `<StepProgress steps={[{ label: 'Customer' }, { label: 'Shipping' }, { label: 'Payment' }, { label: 'Confirm' }]} current={1} tone="success" pointer />
<StepProgress steps={wishes} current={1} connectorProgress={0.5} color="#f25c05" glow />
<StepProgress steps={verification} current={2} variant="dots" showTooltip hideLabels />
<StepProgress steps={health} current={2} variant="icons" color="#1a8cf0" />`;

const codeRings = `<CircularProgress value={70} sublabel="Grade Rating" tone="success" />
<CircularProgress value={70} variant="gauge" size="xl" color="#9b6cf6" />
<CircularProgress indeterminate size="sm" />`;

const icon = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);
const healthSteps = [
  { label: 'Health Risk Assessments', description: 'Earn 10 points', icon: icon('M7 3h7l4 4v14H7zM14 3v4h4M9.5 14h1.5l1-2 1.5 4 1-2h1.5') },
  {
    label: 'Add Medical Records',
    description: 'Earn 20 points',
    icon: icon('M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 15h5M10 18h3M11.5 8.5v3M10 10h3'),
  },
  {
    label: 'Book Health Check',
    description: 'Earn 30 points',
    icon: icon('M6 4v5a4 4 0 008 0V4M10 13v2a4 4 0 008 0v-1M18 14a2 2 0 100-4 2 2 0 000 4'),
  },
  {
    label: 'Add Family Members',
    description: 'Earn 40 points',
    icon: icon('M8 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM16 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4 21v-7a4 4 0 018 0v7M12 21v-7a4 4 0 018 0v7'),
  },
  {
    label: 'Take a Challenge',
    description: 'Earn 50 points',
    icon: icon('M12 21a9 9 0 110-18 9 9 0 010 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12l7-7M16 5h3v3'),
  },
];

export function ProgressPage({ theme }: { theme: SiteTheme }) {
  const kpis: Array<{ color: string; variant: 'circle' | 'gauge' }> = [
    { color: '#22c55e', variant: 'circle' },
    { color: '#f5b83d', variant: 'circle' },
    { color: '#9b6cf6', variant: 'gauge' },
    { color: '#ef4444', variant: 'gauge' },
  ];
  return (
    <>
      <section className="page-hero">
        <Tile name="bar" tone="pink" size="lg" />
        <p className="eyebrow">Progress components</p>
        <h1 className="page-hero__title">Progress you can feel</h1>
        <p className="lead">
          <code>ProgressBar</code>, <code>SegmentedProgress</code>, <code>StepProgress</code> and <code>CircularProgress</code> — uploads,
          quotas, checkouts, sessions and KPIs, with the same theme tokens as the timelines.
        </p>
        <nav className="page-hero__toc" aria-label="On this page">
          {[
            ['pg-status', 'Status'],
            ['pg-styles', 'Track styles'],
            ['pg-segments', 'Segments'],
            ['pg-steps', 'Steps'],
            ['pg-rings', 'Rings & gauges'],
            ['pg-live', 'Live demo'],
            ['pg-config', 'Configurator'],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
      </section>

      <div className="container pshows">
        <Showcase
          id="pg-status"
          eyebrow="Linear"
          title="Uploads, quotas and states"
          lead="Labels, info tooltips, helper text, status icons and cancel actions — shown in light and dark from the same markup."
          code={codeStatus}
        >
          <div className="duo">
            <div className="duo__panel">
              <StatusStack theme="light" />
            </div>
            <div className="duo__panel duo__panel--dark">
              <StatusStack theme="dark" />
            </div>
          </div>
        </Showcase>

        <Showcase
          id="pg-styles"
          eyebrow="Variants"
          title="Seven track styles"
          lead="Segmented, dots, bars, slanted and chevron tracks, plus outlined, striped, buffered, indeterminate and value bubbles."
          code={codeStyles}
        >
          <div className="pgrid">
            <StyleCard title="Segmented">
              <ProgressBar
                theme={theme}
                variant="segmented"
                segments={4}
                value={40}
                color="#db2777"
                aria-label="Segmented"
                onCancel={() => {}}
              />
            </StyleCard>
            <StyleCard title="Thumb">
              <ProgressBar theme={theme} thumb value={52} color="#db2777" aria-label="Thumb" onCancel={() => {}} />
            </StyleCard>
            <StyleCard title="Milestones">
              <ProgressBar
                theme={theme}
                variant="segmented"
                segments={4}
                milestones={[25, 50, 75, 100]}
                value={38}
                color="#db2777"
                aria-label="Milestones"
              />
            </StyleCard>
            <StyleCard title="Dots">
              <ProgressBar theme={theme} variant="dots" value={45} color="#db2777" aria-label="Dots" onCancel={() => {}} />
            </StyleCard>
            <StyleCard title="Bars">
              <ProgressBar theme={theme} variant="bars" value={74} color="#db2777" valuePosition="end" aria-label="Bars" />
            </StyleCard>
            <StyleCard title="Slanted">
              <ProgressBar theme={theme} variant="slanted" value={86} color="#db2777" aria-label="Slanted" onCancel={() => {}} />
            </StyleCard>
            <StyleCard title="Chevron">
              <ProgressBar theme={theme} variant="chevron" value={40} color="#ec4899" aria-label="Chevron" onCancel={() => {}} />
            </StyleCard>
            <StyleCard title="Outlined · value inside">
              <ProgressBar
                theme={theme}
                variant="outlined"
                valuePosition="inside"
                value={52}
                color="#db2777"
                size="lg"
                aria-label="Outlined"
                onCancel={() => {}}
              />
            </StyleCard>
            <StyleCard title="Value bubble">
              <ProgressBar theme={theme} label="Sharing love…" valuePosition="tooltip" value={78} color="#db2777" />
            </StyleCard>
            <StyleCard title="Striped · animated">
              <ProgressBar theme={theme} striped="animated" value={64} size="lg" tone="info" label="Rendering" />
            </StyleCard>
            <StyleCard title="Buffer">
              <ProgressBar theme={theme} value={35} buffer={70} label="Streaming" formatValue={(_, __, p) => `${p}% · buffered 70%`} />
            </StyleCard>
            <StyleCard title="Indeterminate">
              <ProgressBar theme={theme} indeterminate label="Connecting…" status="loading" />
            </StyleCard>
            <StyleCard title="Growing in progress…">
              <ProgressBar
                theme={theme}
                variant="outlined"
                valuePosition="inside"
                value={58}
                color="#db2777"
                size="xl"
                formatValue={() => 'Growing in progress…'}
                aria-label="Growing"
              />
            </StyleCard>
            <StyleCard title="Fraction">
              <ProgressBar
                theme={theme}
                valuePosition="inside"
                value={3}
                max={10}
                color="#db2777"
                size="xl"
                formatValue={(v, m) => `${v} / ${m}`}
                aria-label="Fraction"
              />
            </StyleCard>
            <StyleCard title="Page loading">
              <div className="pcenter">
                <strong className="pbig">72%</strong>
                <ProgressBar
                  theme={theme}
                  value={72}
                  tone="contrast"
                  glow
                  valuePosition="none"
                  label="Please wait while the page is loading"
                />
              </div>
            </StyleCard>
          </div>
        </Showcase>

        <Showcase
          id="pg-segments"
          eyebrow="Segmented"
          title="Sessions with status"
          lead="Each segment carries its own status and tooltip — hover or focus a segment. Empty slots are not counted."
          code={codeSegments}
        >
          <div className="pcard pcard--lg">
            <div className="psegs">
              <div className="psegs__row">
                <p className="psegs__state">Empty</p>
                <SegmentedProgress
                  theme={theme}
                  label="Your Progress"
                  segments={Array.from({ length: 12 }, () => ({ status: 'empty' as const, tooltip: 'No appointment yet' }))}
                />
              </div>
              <div className="psegs__row">
                <p className="psegs__state">Recommended but not booked</p>
                <SegmentedProgress theme={theme} label="Your Progress" segments={recommended} />
              </div>
              <div className="psegs__row">
                <p className="psegs__state">In progress</p>
                <SegmentedProgress theme={theme} label="Your Progress" segments={inProgress} />
              </div>
              <div className="psegs__row">
                <p className="psegs__state">Complete</p>
                <SegmentedProgress theme={theme} label="Your Progress" segments={complete} />
              </div>
              <div className="psegs__row">
                <p className="psegs__state">Missed</p>
                <SegmentedProgress theme={theme} label="Your Progress" segments={missed} />
              </div>
            </div>
          </div>
        </Showcase>

        <Showcase
          id="pg-steps"
          eyebrow="Steps"
          title="Checkouts, wizards and journeys"
          lead="Numbered, dot and icon markers; connectors fill as you move; optional pointer, tooltip and glow."
          code={codeSteps}
        >
          <div className="psteps">
            <div className="pcard pcard--soft pcard--violet">
              {[0, 1, 2, 3].map((c) => (
                <div className="pstep-card" key={c}>
                  <StepProgress
                    theme="light"
                    steps={[{ label: 'Customer' }, { label: 'Shipping' }, { label: 'Payment' }, { label: 'Confirm' }]}
                    current={c}
                    tone="success"
                    pointer
                    aria-label={`Checkout, step ${c + 1}`}
                  />
                </div>
              ))}
            </div>
            <div className="psteps__col">
              <div className="pcard pcard--lg">
                <p className="pcard__title">Your wishes</p>
                <StepProgress
                  theme={theme}
                  steps={[
                    { label: 'Personal guide' },
                    { label: 'Additional services' },
                    { label: 'Buying tickets' },
                    { label: 'Your contacts' },
                  ]}
                  current={1}
                  connectorProgress={0.5}
                  color="#f25c05"
                  glow
                />
              </div>
              <div className="pcard pcard--lg">
                <p className="pcard__title">Verification</p>
                <StepProgress
                  theme={theme}
                  steps={[{ label: 'Account' }, { label: 'Identity' }, { label: 'Verification' }, { label: 'Done' }]}
                  current={2}
                  variant="dots"
                  color="#2563eb"
                  showTooltip
                  hideLabels
                />
              </div>
              <div className="pcard pcard--lg">
                <p className="pcard__title">5 steps to a healthier you</p>
                <StepProgress theme={theme} steps={healthSteps} current={2} variant="icons" color="#1a8cf0" />
                <div className="ppoints">
                  <ProgressBar
                    theme={theme}
                    value={30}
                    max={150}
                    color="#1a8cf0"
                    valuePosition="tooltip"
                    formatValue={(v, m) => `${v}/${m} pts`}
                    aria-label="Points earned"
                  />
                </div>
              </div>
            </div>
          </div>
        </Showcase>

        <Showcase
          id="pg-rings"
          eyebrow="Circular"
          title="Rings and gauges"
          lead="Full rings or open gauges with any sweep, sizes from icon to hero, and indeterminate spinners."
          code={codeRings}
        >
          <div className="prings">
            {kpis.map((k, i) => (
              <div className="pkpi" key={i}>
                <p className="pkpi__title">Bounce Rate</p>
                <p className="pkpi__sub">Evaluates over 12,000 emails</p>
                <CircularProgress
                  theme={theme}
                  value={70}
                  color={k.color}
                  variant={k.variant}
                  size="lg"
                  sublabel={k.variant === 'circle' ? 'Grade Rating' : undefined}
                />
                <a className="pkpi__link" href="#pg-rings">
                  Learn more
                </a>
              </div>
            ))}
          </div>
          <div className="pcard pcard--lg pring-row">
            {(['xs', 'sm', 'md', 'lg'] as const).map((s) => (
              <CircularProgress
                key={s}
                theme={theme}
                value={70}
                size={s}
                color="#9b6cf6"
                sublabel={s === 'xs' || s === 'sm' ? undefined : 'Grade Rating'}
              />
            ))}
            <CircularProgress theme={theme} value={82} size="lg" color="#6366f1" sublabel="Score" />
            <CircularProgress theme={theme} value={64} size="lg" variant="gauge" arc={180} color="#0ea5e9" sublabel="Half gauge" />
            <CircularProgress theme={theme} indeterminate size="sm" aria-label="Loading" />
          </div>
        </Showcase>

        <Showcase
          id="pg-live"
          eyebrow="Live"
          title="Wired to real state"
          lead="Values, statuses and actions update in place — transitions, spinners, glows and screen-reader announcements included."
        >
          <LiveDemo theme={theme} />
        </Showcase>

        <Showcase
          id="pg-config"
          eyebrow="Configurator"
          title="Build your progress bar"
          lead="Every control is a real prop. Copy the generated code straight into your app."
        >
          <ProgressPlayground />
        </Showcase>
      </div>
    </>
  );
}
