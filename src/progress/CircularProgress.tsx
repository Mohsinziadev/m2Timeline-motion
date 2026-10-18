'use client';

import { useId, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../core/env';
import { percentOf, rootProps, type ProgressBaseProps } from './shared';

export interface CircularProgressProps extends ProgressBaseProps {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  /** Full ring or an open gauge. @default 'circle' */
  variant?: 'circle' | 'gauge';
  /** Diameter in px or a preset. @default 'md' (96px) */
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Stroke width in px. Defaults to ~9% of the size. */
  thickness?: number;
  /** Sweep of the gauge in degrees (90–359). @default 240 */
  arc?: number;
  /** Main center text. Defaults to the percentage; `false` hides it. */
  label?: ReactNode | false;
  /** Small text under the label, e.g. "Grade Rating". */
  sublabel?: ReactNode;
  /** Custom center content (replaces label and sublabel). */
  children?: ReactNode;
  /** Rounded stroke ends. @default true */
  rounded?: boolean;
  formatValue?: (value: number, max: number, percent: number) => ReactNode;
  'aria-label'?: string;
}

const SIZES = { xs: 40, sm: 64, md: 96, lg: 140, xl: 200 } as const;

function point(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return `${(50 + r * Math.cos(rad)).toFixed(3)} ${(50 + r * Math.sin(rad)).toFixed(3)}`;
}

/** Ring and gauge progress indicators, drawn with a single SVG path animated by CSS. */
export function CircularProgress(props: CircularProgressProps) {
  const { value = 0, max = 100, indeterminate = false, variant = 'circle', rounded = true, label, sublabel, children, formatValue } = props;
  const id = useId();
  const px = typeof props.size === 'number' ? props.size : SIZES[props.size ?? 'md'];
  const thickness = props.thickness ?? Math.max(3, Math.round(px * 0.09));
  const stroke = (thickness / px) * 100; // in viewBox units
  const r = 50 - stroke / 2;
  const pct = percentOf(value, max);
  const gauge = variant === 'gauge';
  const arc = gauge ? Math.min(359, Math.max(90, props.arc ?? 240)) : 360;
  const gap = 360 - arc;

  let d: string;
  let height = 100;
  if (gauge) {
    const startDeg = 90 + gap / 2;
    const endDeg = startDeg + arc;
    d = `M ${point(r, startDeg)} A ${r} ${r} 0 ${arc > 180 ? 1 : 0} 1 ${point(r, endDeg)}`;
    height = Math.min(100, 50 + r * Math.cos(((gap / 2) * Math.PI) / 180) + stroke / 2 + 0.5);
  } else {
    d = `M 50 ${50 - r} A ${r} ${r} 0 1 1 49.999 ${50 - r}`;
  }

  const text =
    label === false ? null : (label ?? (indeterminate ? null : formatValue ? formatValue(value, max, pct) : `${Math.round(pct)}%`));
  const root = rootProps(props);
  const style = {
    ...root.style,
    '--m2t-ring-size': `${px}px`,
    '--m2t-ring-v': pct,
    '--m2t-ring-ratio': `${100 / height}`,
  } as CSSProperties;

  return (
    <div
      {...root}
      className={cx(root.className, 'm2t-ring')}
      data-variant={variant}
      data-indeterminate={indeterminate ? '' : undefined}
      style={style}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(pct)}
      aria-label={props['aria-label'] ?? (typeof sublabel === 'string' ? sublabel : 'Progress')}
    >
      <svg viewBox={`0 0 100 ${height.toFixed(2)}`} className="m2t-ring__svg" aria-hidden="true" focusable="false">
        {Array.isArray(props.color) && (
          <defs>
            <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={props.color[0]} />
              <stop offset="1" stopColor={props.color[1]} />
            </linearGradient>
          </defs>
        )}
        <path className="m2t-ring__track" d={d} pathLength={100} strokeWidth={stroke} strokeLinecap={rounded ? 'round' : 'butt'} />
        <path
          className="m2t-ring__value"
          d={d}
          pathLength={100}
          strokeWidth={stroke}
          strokeLinecap={rounded ? 'round' : 'butt'}
          stroke={Array.isArray(props.color) ? `url(#${id}-g)` : undefined}
        />
      </svg>
      {(children ?? text ?? sublabel) ? (
        <div className="m2t-ring__center">
          {children ?? (
            <>
              {text !== null && <span className="m2t-ring__label">{text}</span>}
              {sublabel ? <span className="m2t-ring__sublabel">{sublabel}</span> : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
