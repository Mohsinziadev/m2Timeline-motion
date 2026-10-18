'use client';

import { useId, type CSSProperties, type ReactNode } from 'react';
import { clamp, cx } from '../core/env';
import type { TimelineTheme } from '../types';

export type ProgressTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'contrast';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Props shared by every progress component. */
export interface ProgressBaseProps {
  /** Color scheme. `auto` follows `prefers-color-scheme`. @default 'auto' */
  theme?: TimelineTheme;
  /** Semantic color. @default 'accent' */
  tone?: ProgressTone;
  /** Custom color, or a `[from, to]` gradient. Overrides `tone`. */
  color?: string | [string, string];
  /** Animate the fill when the component mounts. @default true */
  animated?: boolean;
  /** Glow around the filled part / active markers. @default false */
  glow?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

export function percentOf(value: number | undefined, max: number | undefined): number {
  const m = typeof max === 'number' && max > 0 ? max : 100;
  const v = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return clamp((v / m) * 100, 0, 100);
}

export function rootProps(p: ProgressBaseProps, ...classes: Array<string | false | undefined>) {
  const [from, to] = Array.isArray(p.color) ? p.color : [p.color, undefined];
  return {
    id: p.id,
    className: cx('m2t', 'm2t-p', ...classes, p.className),
    'data-theme': p.theme ?? 'auto',
    'data-tone': p.tone ?? 'accent',
    'data-animated': p.animated === false ? undefined : '',
    'data-glow': p.glow ? '' : undefined,
    style: {
      ...(from ? { '--m2t-p-c': from } : null),
      ...(to ? { '--m2t-p-c2': to } : null),
      ...p.style,
    } as CSSProperties,
  };
}

/** Dark tooltip bubble, shown on hover / focus of its positioned parent (or always with `open`). */
export function Tip({
  id,
  children,
  open,
  placement = 'top',
  className,
}: {
  id?: string;
  children: ReactNode;
  open?: boolean;
  placement?: 'top' | 'bottom';
  className?: string;
}) {
  return (
    <span id={id} role="tooltip" className={cx('m2t-tip', className)} data-open={open ? '' : undefined} data-placement={placement}>
      {children}
    </span>
  );
}

/** A small "i" button that reveals a tooltip. */
export function InfoTip({ children, label = 'More information' }: { children: ReactNode; label?: string }) {
  const id = useId();
  return (
    <span className="m2t-p__info-wrap">
      <button type="button" className="m2t-p__info" aria-label={label} aria-describedby={id}>
        <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
          <circle cx="8" cy="8" r="8" fill="currentColor" />
          <path d="M8 7v4.5M8 4.6v.01" stroke="var(--m2t-surface, #fff)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <Tip id={id}>{children}</Tip>
    </span>
  );
}

export function Spinner() {
  return (
    <svg className="m2t-p__spinner" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" focusable="false">
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={i}
          x1="12"
          y1="3"
          x2="12"
          y2="6.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity={0.25 + (i / 8) * 0.75}
          transform={`rotate(${i * 45} 12 12)`}
        />
      ))}
    </svg>
  );
}

export function CircleCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 12.3l2.8 2.8L16.2 9.6" />
    </svg>
  );
}

export function CircleX() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6" />
    </svg>
  );
}

export function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </svg>
  );
}
