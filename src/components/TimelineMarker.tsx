'use client';

import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../core/env';
import type { TimelineItem, TimelineMarkerShape } from '../types';
import { makeRenderContext, useTimelineConfig } from './context';
import { StatusIcon } from './parts';

export interface TimelineMarkerProps {
  item: TimelineItem;
  /** Position in the displayed list (used by the `number` shape). */
  index: number;
  total?: number;
  active?: boolean;
  shape?: TimelineMarkerShape;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Overrides the marker content. */
  children?: ReactNode;
}

/** The dot / icon / number that sits on the connector line. Decorative for assistive tech. */
export function TimelineMarker({ item, index, total = 0, active = false, shape, size, className, children }: TimelineMarkerProps) {
  const config = useTimelineConfig();
  const resolvedShape = shape ?? config.marker;
  if (resolvedShape === 'none') return null;

  const { event } = item;
  let content: ReactNode = children;
  if (content === undefined && config.renderMarker) {
    const custom = config.renderMarker(event, makeRenderContext(item, index, total, active, false, config));
    if (custom !== undefined && custom !== null) {
      return (
        <span className={cx('m2t-marker-custom', config.classNames.marker, className)} aria-hidden="true">
          {custom}
        </span>
      );
    }
  }
  if (content === undefined) {
    if (event.icon) content = event.icon;
    else if (resolvedShape === 'number') content = index + 1;
    else content = <StatusIcon status={item.status} />;
  }

  const hasContent = content !== null && content !== undefined && content !== false;
  const resolvedSize = size ?? (event.icon || resolvedShape === 'number' ? 'lg' : 'sm');

  return (
    <span
      className={cx('m2t-marker', config.classNames.marker, className)}
      data-shape={resolvedShape}
      data-size={resolvedSize}
      data-status={item.status}
      data-active={active ? '' : undefined}
      data-highlight={event.highlight ? '' : undefined}
      data-filled={hasContent ? '' : undefined}
      style={event.color ? ({ '--m2t-item-accent': event.color } as CSSProperties) : undefined}
      aria-hidden="true"
    >
      {hasContent && <span className="m2t-marker__content">{content}</span>}
    </span>
  );
}
