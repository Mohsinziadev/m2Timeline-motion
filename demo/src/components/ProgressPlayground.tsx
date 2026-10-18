import { ProgressBar, type ProgressBarProps } from 'm2timeline-motion';
import { useMemo, useState } from 'react';
import { toLiteral } from '../config';
import { CodeBlock, Field, Segmented, Select, Slider, Toggle } from './ui';

type Variant = NonNullable<ProgressBarProps['variant']>;
type Status = NonNullable<ProgressBarProps['status']>;
type Tone = NonNullable<ProgressBarProps['tone']> | 'custom';
type ValuePos = NonNullable<ProgressBarProps['valuePosition']>;

interface State {
  variant: Variant;
  size: NonNullable<ProgressBarProps['size']>;
  tone: Tone;
  color: string;
  gradient: boolean;
  color2: string;
  status: Status;
  valuePosition: ValuePos;
  labelPosition: 'top' | 'start';
  label: string;
  info: string;
  helperText: string;
  value: number;
  segments: number;
  striped: 'off' | 'on' | 'animated';
  thumb: boolean;
  glow: boolean;
  indeterminate: boolean;
  milestones: boolean;
  cancel: boolean;
  previewTheme: 'light' | 'dark';
}

const initial: State = {
  variant: 'solid',
  size: 'md',
  tone: 'accent',
  color: '#db2777',
  gradient: false,
  color2: '#f472b6',
  status: 'loading',
  valuePosition: 'top',
  labelPosition: 'top',
  label: 'Uploading…',
  info: 'Files upload in the background',
  helperText: '27MB of 60MB',
  value: 45,
  segments: 8,
  striped: 'off',
  thumb: false,
  glow: false,
  indeterminate: false,
  milestones: false,
  cancel: true,
  previewTheme: 'light',
};

const UNIT_VARIANTS: Variant[] = ['segmented', 'dots', 'bars', 'slanted', 'chevron'];

function buildProps(s: State): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (s.label) p.label = s.label;
  if (s.info && s.label) p.info = s.info;
  if (s.indeterminate) p.indeterminate = true;
  else p.value = s.value;
  if (s.status !== 'default') p.status = s.status;
  if (s.variant !== 'solid') p.variant = s.variant;
  if (UNIT_VARIANTS.includes(s.variant)) p.segments = s.segments;
  if (s.size !== 'md') p.size = s.size;
  if (s.tone === 'custom') p.color = s.gradient ? [s.color, s.color2] : s.color;
  else if (s.tone !== 'accent') p.tone = s.tone;
  const defaultPos = s.label && s.labelPosition === 'top' ? 'top' : 'end';
  if (s.valuePosition !== defaultPos) p.valuePosition = s.valuePosition;
  if (s.labelPosition !== 'top') p.labelPosition = s.labelPosition;
  if (s.helperText) p.helperText = s.helperText;
  if (s.striped !== 'off') p.striped = s.striped === 'animated' ? 'animated' : true;
  if (s.thumb) p.thumb = true;
  if (s.glow) p.glow = true;
  if (s.milestones) p.milestones = [25, 50, 75, 100];
  return p;
}

function code(props: Record<string, unknown>, cancel: boolean) {
  const attrs = Object.entries(props).map(([k, v]) =>
    v === true ? k : typeof v === 'string' ? `${k}=${JSON.stringify(v)}` : `${k}={${toLiteral(v)}}`,
  );
  if (cancel) attrs.push('onCancel={() => abortUpload()}');
  return `import { ProgressBar } from 'm2timeline-motion';
import 'm2timeline-motion/styles.css';

export function UploadProgress() {
  return (
    <ProgressBar
${attrs.map((a) => `      ${a}`).join('\n')}
    />
  );
}
`;
}

export function ProgressPlayground() {
  const [s, setS] = useState<State>(initial);
  const set = <K extends keyof State>(k: K, v: State[K]) => setS((p) => ({ ...p, [k]: v }));
  const props = useMemo(() => buildProps(s), [s]);
  const snippet = useMemo(() => code(props, s.cancel), [props, s.cancel]);

  return (
    <div className="ppg">
      <div className="ppg__controls" aria-label="Progress bar settings" role="group">
        <Select
          label="Variant"
          value={s.variant}
          options={['solid', 'segmented', 'dots', 'bars', 'slanted', 'chevron', 'outlined'] as const}
          onChange={(v) => set('variant', v)}
        />
        {UNIT_VARIANTS.includes(s.variant) && (
          <Slider
            label="Segments"
            value={s.segments}
            min={2}
            max={s.variant === 'dots' || s.variant === 'bars' ? 60 : 16}
            onChange={(v) => set('segments', v)}
          />
        )}
        <Slider label="Value" value={s.value} min={0} max={100} unit="%" onChange={(v) => set('value', v)} />
        <Segmented
          label="Status"
          value={s.status}
          options={['default', 'loading', 'success', 'error'] as const}
          onChange={(v) => set('status', v)}
        />
        <Segmented label="Size" value={s.size} options={['xs', 'sm', 'md', 'lg', 'xl'] as const} onChange={(v) => set('size', v)} />
        <Select
          label="Color"
          value={s.tone}
          options={['accent', 'success', 'warning', 'danger', 'info', 'neutral', 'contrast', 'custom'] as const}
          onChange={(v) => set('tone', v)}
        />
        {s.tone === 'custom' && (
          <div className="ppg__colors">
            <input type="color" className="color" aria-label="Fill color" value={s.color} onChange={(e) => set('color', e.target.value)} />
            <Toggle label="Gradient" checked={s.gradient} onChange={(v) => set('gradient', v)} />
            {s.gradient && (
              <input
                type="color"
                className="color"
                aria-label="Gradient end color"
                value={s.color2}
                onChange={(e) => set('color2', e.target.value)}
              />
            )}
          </div>
        )}
        <Select
          label="Value position"
          value={s.valuePosition}
          options={['top', 'start', 'end', 'inside', 'tooltip', 'none'] as const}
          onChange={(v) => set('valuePosition', v)}
        />
        <Segmented
          label="Label position"
          value={s.labelPosition}
          options={['top', 'start'] as const}
          onChange={(v) => set('labelPosition', v)}
        />
        <Field label="Label">
          {(id) => <input id={id} className="select" value={s.label} onChange={(e) => set('label', e.target.value)} />}
        </Field>
        <Field label="Helper text">
          {(id) => <input id={id} className="select" value={s.helperText} onChange={(e) => set('helperText', e.target.value)} />}
        </Field>
        <Segmented label="Stripes" value={s.striped} options={['off', 'on', 'animated'] as const} onChange={(v) => set('striped', v)} />
        <Toggle label="Thumb" checked={s.thumb} onChange={(v) => set('thumb', v)} />
        <Toggle label="Glow" checked={s.glow} onChange={(v) => set('glow', v)} />
        <Toggle label="Milestones" checked={s.milestones} onChange={(v) => set('milestones', v)} />
        <Toggle label="Cancel button" checked={s.cancel} onChange={(v) => set('cancel', v)} />
        <Toggle label="Indeterminate" checked={s.indeterminate} onChange={(v) => set('indeterminate', v)} />
      </div>
      <div className="ppg__stage">
        <div className="ppg__bar">
          <Segmented label="Preview" value={s.previewTheme} options={['light', 'dark'] as const} onChange={(v) => set('previewTheme', v)} />
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setS(initial)}>
            Reset
          </button>
        </div>
        <div className={`ppg__preview ${s.previewTheme === 'dark' ? 'ppg__preview--dark' : ''}`}>
          <div className="ppg__frame">
            <ProgressBar {...(props as ProgressBarProps)} theme={s.previewTheme} onCancel={s.cancel ? () => set('value', 0) : undefined} />
          </div>
        </div>
        <CodeBlock code={snippet} title="UploadProgress.tsx" />
      </div>
    </div>
  );
}
