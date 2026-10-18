import { Timeline, type LayoutVariant, type TimelineEvent, type TimelineProps } from 'm2timeline-motion';
import { useEffect, useMemo, useState } from 'react';
import { buildProps, defaultOptions, generateCode, initialConfig, type PlaygroundConfig } from '../config';
import { datasetLabels, datasets, makeExtraEvent, type DatasetKey } from '../data';
import { variantById, variantInfo } from '../variants';
import { DataEditor } from './DataEditor';
import { CodeBlock, Segmented, Select, Slider, Toggle } from './ui';

const ACCENTS: Array<{ name: string; value: string }> = [
  { name: 'Theme default', value: '' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Sky', value: '#0284c7' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Graphite', value: '#334155' },
];

const DEVICES = { desktop: '100%', tablet: '820px', mobile: '390px' } as const;
type Device = keyof typeof DEVICES;
type Tab = 'layout' | 'style' | 'motion' | 'features' | 'data';

interface LogEntry {
  id: number;
  text: string;
}

export function Playground({ request }: { request: { variant: LayoutVariant; nonce: number } | null }) {
  const [config, setConfig] = useState<PlaygroundConfig>(() => initialConfig('vertical'));
  const [tab, setTab] = useState<Tab>('layout');
  const [device, setDevice] = useState<Device>('desktop');
  const [replay, setReplay] = useState(0);
  const [extra, setExtra] = useState<TimelineEvent[]>([]);
  const [custom, setCustom] = useState<TimelineEvent[] | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [codeStyle, setCodeStyle] = useState<'unified' | 'component'>('component');
  const [fullData, setFullData] = useState(false);

  const set = <K extends keyof PlaygroundConfig>(key: K, value: PlaygroundConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));
  const setOption = (key: string, value: string | number | boolean) =>
    setConfig((c) => ({ ...c, options: { ...c.options, [key]: value } }));

  const selectVariant = (variant: LayoutVariant) => {
    setConfig((c) => ({ ...c, variant, dataset: variantById[variant].dataset, options: defaultOptions(variant) }));
    setExtra([]);
    setCustom(null);
  };

  // "Open in playground" from the gallery
  useEffect(() => {
    if (!request) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with an external navigation request
    selectVariant(request.variant);
    setTab('layout');
  }, [request]);

  const events = useMemo(() => [...(custom ?? datasets[config.dataset]), ...extra], [config.dataset, custom, extra]);
  const props = useMemo(() => buildProps(config), [config]);
  const code = useMemo(() => generateCode(config, events, { style: codeStyle, fullData }), [config, events, codeStyle, fullData]);
  const info = variantById[config.variant];

  const push = (text: string) => setLog((l) => [{ id: Date.now() + Math.random(), text }, ...l].slice(0, 6));
  const handlers = config.logEvents
    ? {
        onEventClick: (e: TimelineEvent) => push(`onEventClick → "${String(e.title)}"`),
        onExpandedChange: (ids: Array<string | number>) => push(`onExpandedChange → [${ids.join(', ')}]`),
        onActiveChange: (id: string | number | null) => push(`onActiveChange → ${String(id)}`),
      }
    : {};

  const timelineProps = { variant: config.variant, events, ...props, ...handlers } as TimelineProps;
  const dark = config.theme === 'dark';

  return (
    <div className="pg">
      <aside className="pg__panel" aria-label="Timeline settings">
        <div className="tabs" role="tablist" aria-label="Settings groups">
          {(['layout', 'style', 'motion', 'features', 'data'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`tab-${t}`}
              aria-selected={tab === t}
              aria-controls={`panel-${t}`}
              className="tabs__btn"
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="pg__controls" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab === 'layout' && (
            <>
              <Select
                label="Layout"
                value={config.variant}
                options={variantInfo.map((v) => v.id)}
                format={(v) => variantById[v].name}
                onChange={selectVariant}
              />
              <p className="pg__desc">{info.tagline}</p>
              <Select
                label="Sample data"
                value={config.dataset}
                options={Object.keys(datasets) as DatasetKey[]}
                format={(k) => datasetLabels[k]}
                onChange={(v) => {
                  set('dataset', v);
                  setExtra([]);
                  setCustom(null);
                }}
              />
              {info.options.map((o) =>
                o.type === 'toggle' ? (
                  <Toggle key={o.key} label={o.label} checked={Boolean(config.options[o.key])} onChange={(v) => setOption(o.key, v)} />
                ) : (
                  <Select
                    key={o.key}
                    label={o.label}
                    value={config.options[o.key] as string | number}
                    options={o.options}
                    onChange={(v) => setOption(o.key, v)}
                  />
                ),
              )}
              <Segmented label="Order" value={config.order} options={['none', 'asc', 'desc'] as const} onChange={(v) => set('order', v)} />
              <Select
                label="Group by"
                value={config.groupBy}
                options={['default', 'none', 'year', 'quarter', 'month', 'group', 'category'] as const}
                format={(v) => (v === 'default' ? 'Layout default' : v)}
                onChange={(v) => set('groupBy', v)}
              />
            </>
          )}

          {tab === 'style' && (
            <>
              <Segmented
                label="Theme"
                value={config.theme}
                options={['light', 'dark', 'auto'] as const}
                onChange={(v) => set('theme', v)}
              />
              <Select
                label="Appearance"
                value={config.appearance}
                options={['modern', 'minimal', 'glass', 'editorial', 'vibrant'] as const}
                onChange={(v) => set('appearance', v)}
              />
              <div className="field">
                <span className="field__label">Accent</span>
                <div className="swatches">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      className="swatch"
                      aria-label={a.name}
                      aria-pressed={config.accent === a.value}
                      title={a.name}
                      style={{ background: a.value || 'conic-gradient(#4f46e5, #db2777, #059669, #4f46e5)' }}
                      onClick={() => set('accent', a.value)}
                    />
                  ))}
                  <label className="swatch swatch--custom" title="Custom color">
                    <span className="sr-only">Custom accent color</span>
                    <input type="color" value={config.accent || '#4f46e5'} onChange={(e) => set('accent', e.target.value)} />
                  </label>
                </div>
              </div>
              <Toggle
                label="Gradient accent"
                checked={config.gradient}
                onChange={(v) => setConfig((c) => ({ ...c, gradient: v, accent: c.accent || '#4f46e5' }))}
              />
              {config.gradient && (
                <div className="field">
                  <label className="field__label" htmlFor="accent2">
                    Gradient end
                  </label>
                  <input
                    id="accent2"
                    className="color"
                    type="color"
                    value={config.accent2}
                    onChange={(e) => set('accent2', e.target.value)}
                  />
                </div>
              )}
              <Segmented
                label="Density"
                value={config.density}
                options={['compact', 'comfortable', 'spacious'] as const}
                onChange={(v) => set('density', v)}
              />
              <Toggle label="Custom radius" checked={config.radius !== null} onChange={(v) => set('radius', v ? 14 : null)} />
              {config.radius !== null && (
                <Slider label="Radius" value={config.radius} min={0} max={28} unit="px" onChange={(v) => set('radius', v)} />
              )}
              <Select
                label="Marker"
                value={config.marker}
                options={['dot', 'ring', 'square', 'diamond', 'number', 'none'] as const}
                onChange={(v) => set('marker', v)}
              />
              <Select
                label="Connector"
                value={config.connector}
                options={['solid', 'dashed', 'dotted', 'gradient', 'none'] as const}
                onChange={(v) => set('connector', v)}
              />
              <Toggle label="Animated connector" checked={config.connectorAnimated} onChange={(v) => set('connectorAnimated', v)} />
              <Toggle label="Glow" checked={config.glow} onChange={(v) => set('glow', v)} />
            </>
          )}

          {tab === 'motion' && (
            <>
              <Select
                label="Entrance animation"
                value={config.animation}
                options={['none', 'fade', 'rise', 'slide', 'scale', 'blur', 'reveal'] as const}
                onChange={(v) => {
                  set('animation', v);
                  setReplay((r) => r + 1);
                }}
              />
              {config.animation !== 'none' && (
                <>
                  <Slider
                    label="Duration"
                    value={config.duration}
                    min={150}
                    max={1500}
                    step={50}
                    unit="ms"
                    onChange={(v) => set('duration', v)}
                  />
                  <Slider
                    label="Stagger"
                    value={config.stagger}
                    min={0}
                    max={250}
                    step={10}
                    unit="ms"
                    onChange={(v) => set('stagger', v)}
                  />
                </>
              )}
              <Toggle
                label="Scroll progress line"
                checked={config.scrollProgress}
                onChange={(v) => set('scrollProgress', v)}
                hint="Vertical & story"
              />
              <Toggle label="Track active on scroll" checked={config.trackActive} onChange={(v) => set('trackActive', v)} />
              <button type="button" className="btn btn--secondary btn--block" onClick={() => setReplay((r) => r + 1)}>
                ↻ Replay animation
              </button>
              <p className="pg__desc">
                Animations respect <code>prefers-reduced-motion</code> automatically.
              </p>
            </>
          )}

          {tab === 'features' && (
            <>
              <Toggle label="Search" checked={config.search} onChange={(v) => set('search', v)} />
              <Toggle label="Category filters" checked={config.filters} onChange={(v) => set('filters', v)} />
              <Toggle label="Jump-to navigation" checked={config.jumpTo} onChange={(v) => set('jumpTo', v)} hint="Needs groups" />
              <Segmented
                label="Expandable details"
                value={config.expandable}
                options={['multiple', 'single', 'off'] as const}
                onChange={(v) => set('expandable', v)}
              />
              <Select
                label="Page size"
                value={config.pageSize}
                options={[0, 3, 5]}
                format={(v) => (v === 0 ? 'Show all' : `${v} per page`)}
                onChange={(v) => set('pageSize', v)}
              />
              <Toggle label="Log callbacks" checked={config.logEvents} onChange={(v) => set('logEvents', v)} />
            </>
          )}

          {tab === 'data' && (
            <DataEditor
              key={`${config.variant}-${config.dataset}`}
              events={custom ?? datasets[config.dataset]}
              original={datasets[config.dataset]}
              onApply={(next) => {
                setCustom(next);
                setExtra([]);
              }}
              onReset={() => setCustom(null)}
            />
          )}
        </div>
      </aside>

      <div className="pg__stage">
        <div className="pg__toolbar">
          <div className="segmented" role="radiogroup" aria-label="Preview size">
            {(Object.keys(DEVICES) as Device[]).map((dv) => (
              <button
                key={dv}
                type="button"
                role="radio"
                aria-checked={device === dv}
                className="segmented__btn"
                onClick={() => setDevice(dv)}
              >
                {dv}
              </button>
            ))}
          </div>
          <div className="pg__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setReplay((r) => r + 1)}>
              ↻ Replay
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setExtra((x) => [...x, makeExtraEvent(x.length + 1)])}>
              + Add event
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setConfig(initialConfig(config.variant));
                setCustom(null);
                setExtra([]);
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className={`pg__canvas ${dark ? 'pg__canvas--dark' : ''}`} data-appearance={config.appearance}>
          <div className="pg__device" style={{ maxWidth: DEVICES[device] }} data-device={device}>
            <Timeline key={`${config.variant}-${replay}`} {...timelineProps} />
          </div>
        </div>

        <div className="pg__output">
          <div className="pg__code">
            <div className="pg__code-options">
              <Segmented label="Import" value={codeStyle} options={['component', 'unified'] as const} onChange={setCodeStyle} />
              <Toggle label="Include all data" checked={fullData} onChange={setFullData} />
            </div>
            <CodeBlock code={code} title={`${codeStyle === 'unified' ? 'Timeline' : info.component}.tsx`} maxHeight={460} />
          </div>
          {config.logEvents && (
            <div className="pg__log" aria-live="polite">
              <p className="pg__log-title">Callback log</p>
              {log.length === 0 ? (
                <p className="pg__log-empty">Click or expand an event to see callbacks fire.</p>
              ) : (
                <ol>
                  {log.map((l) => (
                    <li key={l.id}>
                      <code>{l.text}</code>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
