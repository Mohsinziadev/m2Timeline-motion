'use client';

import { useId, type CSSProperties, type ReactNode } from 'react';
import { clamp, cx } from '../core/env';
import {
  CircleCheck,
  CircleX,
  InfoTip,
  percentOf,
  rootProps,
  Spinner,
  Tip,
  XIcon,
  type ProgressBaseProps,
  type ProgressSize,
} from './shared';

export type ProgressBarVariant = 'solid' | 'segmented' | 'dots' | 'bars' | 'slanted' | 'chevron' | 'outlined';
export type ProgressBarStatus = 'default' | 'loading' | 'success' | 'error';
export type ProgressValuePosition = 'top' | 'start' | 'end' | 'inside' | 'tooltip' | 'none';

export interface ProgressMilestone {
  value: number;
  label?: ReactNode;
}

export interface ProgressBarProps extends ProgressBaseProps {
  /** Current value. @default 0 */
  value?: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Secondary (buffered) value, drawn behind the fill. */
  buffer?: number;
  /** Unknown duration: an animated sweep instead of a value. */
  indeterminate?: boolean;
  /** Text above (or before) the bar. Also used as the accessible name. */
  label?: ReactNode;
  /** Content of an "i" tooltip next to the label. */
  info?: ReactNode;
  /** Text below the bar, e.g. "27MB of 60MB". Colored for `error`. */
  helperText?: ReactNode;
  /** Drives color and the status icon (spinner, check, cross). @default 'default' */
  status?: ProgressBarStatus;
  /** Show the status icon next to the value. @default true */
  statusIcon?: boolean;
  /** Where the value is shown. @default 'top' when there is a label, otherwise 'end' */
  valuePosition?: ProgressValuePosition;
  /** Custom value text. @default `${percent}%` */
  formatValue?: (value: number, max: number, percent: number) => ReactNode;
  /** Track style. @default 'solid' */
  variant?: ProgressBarVariant;
  /** Number of units for segmented / dots / bars / slanted / chevron variants. */
  segments?: number;
  /** Thickness. @default 'md' */
  size?: ProgressSize;
  /** Put the label in the same row as the bar. @default 'top' */
  labelPosition?: 'top' | 'start';
  /** Diagonal stripes on the fill; `'animated'` makes them move. */
  striped?: boolean | 'animated';
  /** A knob at the end of the fill. */
  thumb?: boolean;
  /** Tick marks with labels under the bar, e.g. `[25, 50, 75, 100]`. */
  milestones?: Array<number | ProgressMilestone>;
  /** Shows a cancel (×) button. */
  onCancel?: () => void;
  cancelLabel?: string;
  /** Content before / after the bar in the same row (icons, buttons…). */
  start?: ReactNode;
  end?: ReactNode;
  'aria-label'?: string;
  /** Spoken status words. */
  statusLabels?: Partial<Record<ProgressBarStatus, string>>;
}

const DEFAULT_SEGMENTS: Record<ProgressBarVariant, number> = {
  solid: 1,
  outlined: 1,
  segmented: 4,
  dots: 30,
  bars: 40,
  slanted: 12,
  chevron: 8,
};

const STATUS_WORDS: Record<ProgressBarStatus, string> = {
  default: '',
  loading: 'In progress',
  success: 'Complete',
  error: 'Failed',
};

/**
 * A linear progress indicator with labels, statuses, value placements and seven track styles.
 * Accessible as `role="progressbar"`; animates with CSS only.
 */
export function ProgressBar(props: ProgressBarProps) {
  const {
    value = 0,
    max = 100,
    buffer,
    indeterminate = false,
    label,
    info,
    helperText,
    status = 'default',
    statusIcon = true,
    formatValue,
    variant = 'solid',
    size = 'md',
    labelPosition = 'top',
    striped = false,
    thumb = false,
    milestones,
    onCancel,
    cancelLabel = 'Cancel',
    start,
    end,
    statusLabels,
  } = props;
  const labelId = useId();
  const pct = percentOf(value, max);
  const valuePosition = props.valuePosition ?? (label && labelPosition === 'top' ? 'top' : 'end');
  const tone = props.tone ?? (status === 'success' ? 'success' : status === 'error' ? 'danger' : undefined);
  const root = rootProps({ ...props, tone });
  const words = { ...STATUS_WORDS, ...statusLabels };
  const units = variant === 'solid' || variant === 'outlined' ? 1 : Math.max(2, Math.round(props.segments ?? DEFAULT_SEGMENTS[variant]));

  const valueNode = indeterminate ? null : formatValue ? formatValue(value, max, pct) : `${Math.round(pct)}%`;
  const icon =
    statusIcon && status !== 'default' ? (
      <span className="m2t-p__status-icon" data-status={status}>
        {status === 'loading' ? <Spinner /> : status === 'success' ? <CircleCheck /> : <CircleX />}
      </span>
    ) : null;
  const cancel = onCancel ? (
    <button type="button" className="m2t-p__cancel" onClick={onCancel} aria-label={cancelLabel}>
      <XIcon />
    </button>
  ) : null;

  const labelNode = label ? (
    <span className="m2t-pb__label" id={labelId}>
      {label}
      {info ? <InfoTip>{info}</InfoTip> : null}
    </span>
  ) : null;

  // Status icon and cancel join the header only when it exists for a label or value; otherwise they sit at the end of the bar.
  const showHead = labelPosition === 'top' && Boolean(labelNode || (valuePosition === 'top' && valueNode !== null));
  const valueEl = (pos: ProgressValuePosition) =>
    valuePosition === pos && valueNode !== null ? (
      <span className="m2t-pb__value" aria-hidden="true">
        {valueNode}
      </span>
    ) : null;

  const style = {
    '--m2t-pb-v': pct / 100,
    ...(buffer !== undefined ? { '--m2t-pb-b': percentOf(buffer, max) / 100 } : null),
    '--m2t-pb-n': units,
  } as CSSProperties;

  const ariaText = indeterminate ? words[status] || undefined : [`${Math.round(pct)}%`, words[status]].filter(Boolean).join(', ');

  return (
    <div
      {...root}
      className={cx(root.className, 'm2t-pb')}
      data-variant={variant}
      data-size={size}
      data-status={status}
      data-striped={striped ? (striped === 'animated' ? 'animated' : '') : undefined}
      data-indeterminate={indeterminate ? '' : undefined}
      data-value-position={valuePosition}
    >
      {showHead && (
        <div className="m2t-pb__head">
          {labelNode ?? <span />}
          <span className="m2t-pb__meta">
            {valueEl('top')}
            {icon}
            {cancel}
          </span>
        </div>
      )}
      <div className="m2t-pb__row">
        {start}
        {labelPosition === 'start' && labelNode}
        {valueEl('start')}
        <div
          className="m2t-pb__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={indeterminate ? undefined : Math.round(pct)}
          aria-valuetext={ariaText}
          aria-labelledby={label && !props['aria-label'] ? labelId : undefined}
          aria-label={props['aria-label'] ?? (label ? undefined : 'Progress')}
          aria-busy={status === 'loading' || indeterminate ? true : undefined}
          style={style}
        >
          {units === 1 ? (
            <>
              {buffer !== undefined && <span className="m2t-pb__buffer" />}
              <span className="m2t-pb__fill" />
            </>
          ) : (
            Array.from({ length: units }, (_, i) => (
              <span
                key={i}
                className="m2t-pb__unit"
                style={{ '--m2t-pb-u': clamp((pct / 100) * units - i, 0, 1), '--m2t-pb-i': i } as CSSProperties}
              >
                <span className="m2t-pb__fill" />
              </span>
            ))
          )}
          {thumb && !indeterminate && <span className="m2t-pb__thumb" />}
          {milestones?.map((m) => {
            const at = percentOf(typeof m === 'number' ? m : m.value, max);
            return at > 0 && at < 100 ? <span key={`t${at}`} className="m2t-pb__tick" style={{ left: `${at}%` }} /> : null;
          })}
          {valuePosition === 'tooltip' && valueNode !== null && (
            <Tip open className="m2t-pb__bubble">
              {valueNode}
            </Tip>
          )}
          {valuePosition === 'inside' && valueNode !== null && (
            <span className="m2t-pb__inside" aria-hidden="true">
              {valueNode}
            </span>
          )}
        </div>
        {valueEl('end')}
        {!showHead && icon}
        {!showHead && cancel}
        {end}
      </div>
      {milestones && milestones.length > 0 && (
        <div className="m2t-pb__milestones" aria-hidden="true">
          {milestones.map((m) => {
            const mv = typeof m === 'number' ? m : m.value;
            const at = percentOf(mv, max);
            return (
              <span key={`l${mv}`} data-passed={pct >= at ? '' : undefined} style={{ left: `${at}%` }}>
                {typeof m === 'number' ? mv : (m.label ?? mv)}
              </span>
            );
          })}
        </div>
      )}
      {helperText ? (
        <p className="m2t-pb__helper" data-status={status}>
          {helperText}
        </p>
      ) : null}
      {(status === 'success' || status === 'error') && (
        <span className="m2t-sr" role="status">
          {words[status]}
        </span>
      )}
    </div>
  );
}
