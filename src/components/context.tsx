'use client';

import { createContext, useContext, type MouseEvent } from 'react';
import { formatParsedDate } from '../core/date';
import { defaultLabels } from '../core/labels';
import type {
  ParsedDate,
  TimelineCommonProps,
  TimelineItem,
  TimelineLabels,
  TimelineMarkerShape,
  TimelineRenderContext,
  TimelineSlot,
} from '../types';

export interface TimelineConfig {
  labels: TimelineLabels;
  headingLevel: 2 | 3 | 4 | 5 | 6;
  idPrefix: string;
  locale: string;
  timeZone: string;
  marker: TimelineMarkerShape;
  /** Events with `details` can be expanded. */
  expandable: boolean;
  /** An `onEventClick` handler is attached. */
  clickable: boolean;
  classNames: Partial<Record<TimelineSlot, string>>;
  formatDate?: TimelineCommonProps['formatDate'];
  renderEvent?: TimelineCommonProps['renderEvent'];
  renderMarker?: TimelineCommonProps['renderMarker'];
  renderDate?: TimelineCommonProps['renderDate'];
  toggle: (key: string) => void;
  select: (key: string) => void;
  activate: (item: TimelineItem, index: number, domEvent: MouseEvent<HTMLElement>) => void;
}

const noop = () => {};

const fallbackConfig: TimelineConfig = {
  labels: defaultLabels,
  headingLevel: 3,
  idPrefix: 'm2t',
  locale: 'en-US',
  timeZone: 'UTC',
  marker: 'dot',
  expandable: true,
  clickable: false,
  classNames: {},
  toggle: noop,
  select: noop,
  activate: noop,
};

export const TimelineConfigContext = createContext<TimelineConfig>(fallbackConfig);

/** Access the configuration of the nearest timeline (works outside one, with defaults). */
export function useTimelineConfig(): TimelineConfig {
  return useContext(TimelineConfigContext);
}

export function formatDatePart(parsed: ParsedDate, item: TimelineItem, config: TimelineConfig): string {
  return config.formatDate
    ? config.formatDate(parsed.date, parsed.precision, item.event)
    : formatParsedDate(parsed, { locale: config.locale, timeZone: config.timeZone });
}

/** Plain-text date for an item, e.g. "Mar 2021 – Present". */
export function getDateText(item: TimelineItem, config: TimelineConfig): string {
  const { event } = item;
  if (typeof event.dateLabel === 'string') return event.dateLabel;
  if (!item.start) return item.ongoing ? config.labels.present : '';
  const start = formatDatePart(item.start, item, config);
  if (item.ongoing) return `${start} – ${config.labels.present}`;
  if (item.end && item.end.time !== item.start.time) {
    const end = formatDatePart(item.end, item, config);
    return end === start ? start : `${start} – ${end}`;
  }
  return start;
}

export function hasDetails(item: TimelineItem): boolean {
  const d = item.event.details;
  return d !== undefined && d !== null && d !== false && d !== '';
}

export function isInteractive(item: TimelineItem, config: TimelineConfig): boolean {
  if (item.event.disabled) return false;
  return config.clickable || (config.expandable && hasDetails(item));
}

export function makeRenderContext(
  item: TimelineItem,
  index: number,
  total: number,
  isActive: boolean,
  isExpanded: boolean,
  config: TimelineConfig,
): TimelineRenderContext {
  return {
    item,
    index,
    total,
    isActive,
    isExpanded,
    isFirst: index === 0,
    isLast: index === total - 1,
    toggle: () => config.toggle(item.key),
    select: () => config.select(item.key),
    dateText: getDateText(item, config),
  };
}

export function detailsId(config: TimelineConfig, item: TimelineItem): string {
  return `${config.idPrefix}-details-${item.index}`;
}
