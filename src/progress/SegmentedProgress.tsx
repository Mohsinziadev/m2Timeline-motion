'use client';

import { useId, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../core/env';
import { CalendarIcon, Check, ClockIcon, rootProps, Tip, XIcon, type ProgressBaseProps, type ProgressSize } from './shared';

export type SegmentStatus = 'complete' | 'current' | 'scheduled' | 'missed' | 'pending' | 'empty';

export interface ProgressSegment {
  status?: SegmentStatus;
  /** Tooltip title, e.g. "V Therapy". */
  label?: ReactNode;
  /** Tooltip secondary line, e.g. a date. */
  description?: ReactNode;
  /** Replaces the whole tooltip. */
  tooltip?: ReactNode;
  /** Custom fill color. */
  color?: string;
}

export interface SegmentedProgressProps extends ProgressBaseProps {
  /** Segment definitions, or a number of segments (combined with `value`). */
  segments: ProgressSegment[] | number;
  /** With a numeric `segments`: how many are complete. */
  value?: number;
  /** Heading above the bar. */
  label?: ReactNode;
  /** Count text. Default `"complete / total"` (empty segments are not counted). `false` hides it. */
  formatCount?: ((complete: number, total: number) => ReactNode) | false;
  /** Gap between segments in px. @default 3 */
  gap?: number;
  size?: ProgressSize;
  /** Makes segments buttons. */
  onSegmentClick?: (index: number, segment: ProgressSegment) => void;
  /** Words used in tooltips and for screen readers. */
  statusLabels?: Partial<Record<SegmentStatus, string>>;
  'aria-label'?: string;
}

const STATUS_LABELS: Record<SegmentStatus, string> = {
  complete: 'Complete',
  current: 'In progress',
  scheduled: 'Scheduled',
  missed: 'Missed',
  pending: 'Not booked',
  empty: 'Nothing scheduled',
};

const STATUS_ICON: Partial<Record<SegmentStatus, () => ReactNode>> = {
  complete: Check,
  scheduled: ClockIcon,
  missed: XIcon,
  pending: CalendarIcon,
};

/**
 * A bar made of discrete segments, each with its own status and tooltip — sessions, appointments,
 * lessons, sprints, story slides.
 */
export function SegmentedProgress(props: SegmentedProgressProps) {
  const { label, formatCount, gap = 3, size = 'md', onSegmentClick } = props;
  const baseId = useId();
  const words = { ...STATUS_LABELS, ...props.statusLabels };
  const segments: ProgressSegment[] =
    typeof props.segments === 'number'
      ? Array.from({ length: Math.max(0, Math.round(props.segments)) }, (_, i) => ({
          status: i < (props.value ?? 0) ? 'complete' : 'pending',
        }))
      : props.segments;

  const total = segments.filter((s) => (s.status ?? 'pending') !== 'empty').length;
  const complete = segments.filter((s) => s.status === 'complete').length;
  const count = formatCount === false ? null : formatCount ? formatCount(complete, total) : `${complete} / ${total}`;
  const root = rootProps(props);
  const pct = total ? Math.round((complete / total) * 100) : 0;
  // Interactive segments cannot live inside role="progressbar" (its children are presentational),
  // so the track becomes a labelled group and the count is exposed as text instead.
  const interactive = Boolean(onSegmentClick) || segments.some((s) => s.tooltip ?? s.label ?? s.description);
  const name = props['aria-label'] ?? (label ? undefined : 'Progress');
  const trackA11y = interactive
    ? {
        role: 'group',
        'aria-labelledby': label && !props['aria-label'] ? `${baseId}-label` : undefined,
        'aria-label': name,
        'aria-describedby': count !== null ? `${baseId}-count` : undefined,
      }
    : {
        role: 'progressbar',
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': pct,
        'aria-valuetext': `${complete} of ${total}`,
        'aria-labelledby': label && !props['aria-label'] ? `${baseId}-label` : undefined,
        'aria-label': name,
      };

  return (
    <div {...root} className={cx(root.className, 'm2t-seg')} data-size={size}>
      {(label || count !== null) && (
        <div className="m2t-seg__head">
          {label ? (
            <span className="m2t-seg__label" id={`${baseId}-label`}>
              {label}
            </span>
          ) : null}
          {count !== null && (
            <span className="m2t-seg__count" id={`${baseId}-count`}>
              {count}
            </span>
          )}
        </div>
      )}
      <div className="m2t-seg__track" {...trackA11y} style={{ '--m2t-seg-gap': `${gap}px` } as CSSProperties}>
        {segments.map((segment, i) => {
          const status = segment.status ?? 'pending';
          const Icon = STATUS_ICON[status];
          const hasTip = Boolean(segment.tooltip ?? segment.label ?? segment.description);
          const tipId = `${baseId}-tip-${i}`;
          const tip = hasTip ? (
            <Tip id={tipId}>
              {segment.tooltip ?? (
                <>
                  {segment.label ? <strong className="m2t-tip__title">{segment.label}</strong> : null}
                  {segment.description ? <span className="m2t-tip__line">{segment.description}</span> : null}
                  <span className="m2t-tip__status" data-status={status}>
                    {Icon ? <Icon /> : null}
                    {words[status]}
                  </span>
                </>
              )}
            </Tip>
          ) : null;
          const common = {
            className: 'm2t-seg__item',
            'data-status': status,
            style: { '--m2t-seg-i': i, ...(segment.color ? { '--m2t-seg-c': segment.color } : null) } as CSSProperties,
          };
          const name = `${i + 1}: ${words[status]}`;
          if (interactive) {
            return (
              <button
                key={i}
                type="button"
                {...common}
                aria-label={typeof segment.label === 'string' ? `${segment.label}, ${name}` : name}
                aria-describedby={hasTip ? tipId : undefined}
                onClick={onSegmentClick ? () => onSegmentClick(i, segment) : undefined}
              >
                {tip}
              </button>
            );
          }
          return <span key={i} {...common} aria-hidden="true" />;
        })}
      </div>
    </div>
  );
}
