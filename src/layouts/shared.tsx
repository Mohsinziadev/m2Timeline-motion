'use client';

import { useMemo, type ReactNode } from 'react';
import { useTimelineConfig } from '../components/context';
import { resolveLabels } from '../core/labels';
import type { TimelineItem, TimelineLabels, TimelineStatus } from '../types';

const REACHED: ReadonlySet<TimelineStatus | undefined> = new Set<TimelineStatus | undefined>(['completed', 'current']);

/**
 * `flags[i]` is `true` when the connector leaving item `i` should be drawn as "travelled": the item
 * is completed and the next one has been reached.
 */
export function connectorFill(items: ReadonlyArray<TimelineItem>): boolean[] {
  return items.map((item, i) => item.status === 'completed' && REACHED.has(items[i + 1]?.status));
}

/** Index of the "current" step: the first `current` item, else the first item that is not completed. */
export function currentIndex(items: ReadonlyArray<TimelineItem>): number {
  const current = items.findIndex((i) => i.status === 'current');
  if (current >= 0) return current;
  const pending = items.findIndex((i) => i.status !== 'completed');
  return pending;
}

/** 0–100 completion for an item: completed = 100, otherwise its `progress` (or 0). */
export function completionOf(item: TimelineItem): number {
  if (item.status === 'completed') return 100;
  if (item.status === 'cancelled') return 0;
  return item.progress ?? 0;
}

export function GroupHeading({ children, className, offset = -1 }: { children: ReactNode; className?: string; offset?: number }) {
  const { headingLevel } = useTimelineConfig();
  const level = Math.min(6, Math.max(2, headingLevel + offset));
  const Heading = `h${level}` as 'h2';
  return <Heading className={className}>{children}</Heading>;
}

export function hasAnyGroup(events: ReadonlyArray<{ group?: string }> | null | undefined): boolean {
  return Array.isArray(events) && events.some((e) => e && typeof e.group === 'string' && e.group !== '');
}

/** Resolved UI strings for use outside the frame's context (layout chrome rendered by the layout itself). */
export function useLabels(overrides: Partial<TimelineLabels> | undefined): TimelineLabels {
  return useMemo(() => resolveLabels(overrides), [overrides]);
}
