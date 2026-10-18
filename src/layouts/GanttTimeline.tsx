'use client';

import { memo, useMemo, type CSSProperties } from 'react';
import { getDateText, hasDetails, useTimelineConfig } from '../components/context';
import { AvatarGroup, Details, StatusBadge, TimelineTitle, VisuallyHidden } from '../components/parts';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { formatWith, parseDate } from '../core/date';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import { useNow } from '../hooks/utils';
import type { DatePrecision, TimelineCommonProps, TimelineDateInput, TimelineItem } from '../types';
import { GroupHeading, hasAnyGroup, useLabels } from './shared';

export type GanttScale = 'auto' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface GanttTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Time-axis unit. `auto` picks one from the date span. @default 'auto' */
  scale?: GanttScale;
  /**
   * Position of the "today" line. Defaults to the client clock (rendered after hydration).
   * Pass a date to render it on the server too, or `false` to hide it.
   */
  today?: TimelineDateInput | false;
  /** Width of the task-name column. @default '15rem' */
  labelWidth?: string;
  /** Minimum chart width before it scrolls horizontally (px). @default 760 */
  minWidth?: number;
  /** Show owner avatars next to task names. @default true */
  showPeople?: boolean;
}

type Unit = Exclude<GanttScale, 'auto'>;
const DAY = 864e5;

function floorTo(t: number, unit: Unit): number {
  const d = new Date(t);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  switch (unit) {
    case 'day':
      return Date.UTC(y, m, d.getUTCDate());
    case 'week': {
      const day = Date.UTC(y, m, d.getUTCDate());
      const dow = (new Date(day).getUTCDay() + 6) % 7; // Monday-based weeks
      return day - dow * DAY;
    }
    case 'month':
      return Date.UTC(y, m, 1);
    case 'quarter':
      return Date.UTC(y, m - (m % 3), 1);
    case 'year':
      return Date.UTC(y, 0, 1);
  }
}

function addUnit(t: number, unit: Unit | DatePrecision, n = 1): number {
  const d = new Date(t);
  switch (unit) {
    case 'day':
      return t + n * DAY;
    case 'week':
      return t + n * 7 * DAY;
    case 'month':
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, d.getUTCDate());
    case 'quarter':
      return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 3 * n, d.getUTCDate());
    case 'year':
      return Date.UTC(d.getUTCFullYear() + n, d.getUTCMonth(), d.getUTCDate());
    default:
      return t;
  }
}

function chooseUnit(span: number): Unit {
  const days = span / DAY;
  if (days <= 35) return 'day';
  if (days <= 150) return 'week';
  if (days <= 800) return 'month';
  if (days <= 365 * 5) return 'quarter';
  return 'year';
}

function tickLabel(t: number, unit: Unit, first: boolean, locale: string): string {
  const d = new Date(t);
  switch (unit) {
    case 'day':
      return first || d.getUTCDate() === 1 ? formatWith(d, { month: 'short', day: 'numeric' }, locale) : String(d.getUTCDate());
    case 'week':
      return formatWith(d, { month: 'short', day: 'numeric' }, locale);
    case 'month':
      return first || d.getUTCMonth() === 0
        ? formatWith(d, { month: 'short', year: 'numeric' }, locale)
        : formatWith(d, { month: 'short' }, locale);
    case 'quarter':
      return `Q${Math.floor(d.getUTCMonth() / 3) + 1}${first || d.getUTCMonth() === 0 ? ` ${d.getUTCFullYear()}` : ''}`;
    case 'year':
      return String(d.getUTCFullYear());
  }
}

interface Span {
  start: number;
  end: number;
  milestone: boolean;
}

function spanOf(item: TimelineItem, now: number | null): Span | null {
  if (!item.start) return null;
  const start = item.start.time;
  if (item.ongoing) return { start, end: Math.max(start + DAY, now ?? start + DAY), milestone: false };
  if (!item.end) return { start, end: start, milestone: true };
  return { start, end: Math.max(start, addUnit(item.end.time, item.end.precision)), milestone: false };
}

interface RowProps {
  item: TimelineItem;
  index: number;
  total: number;
  span: Span | null;
  domain: [number, number];
  active: boolean;
  expanded: boolean;
  showPeople: boolean;
}

const pct = (t: number, [a, b]: [number, number]) => ((t - a) / (b - a)) * 100;

const GanttRow = memo(function GanttRow({ item, index, span, domain, active, expanded, showPeople }: RowProps) {
  const config = useTimelineConfig();
  const { event } = item;
  const dateText = getDateText(item, config);
  const left = span ? pct(span.start, domain) : 0;
  const width = span ? Math.max(0, pct(span.end, domain) - left) : 0;
  const barStyle = {
    '--m2t-bar-start': left,
    '--m2t-bar-width': width,
    '--m2t-bar-progress': (item.status === 'completed' ? 100 : (item.progress ?? 0)) / 100,
  } as CSSProperties;

  return (
    <li
      className={cx('m2t-gantt__row', config.classNames.item)}
      data-expanded={expanded ? '' : undefined}
      {...itemAttrs(item, index, { active })}
    >
      <div className="m2t-gantt__label">
        <TimelineTitle item={item} index={index} expanded={expanded} stretch={false} className="m2t-gantt__name" />
        <div className="m2t-gantt__sub">
          {item.status && <StatusBadge status={item.status} />}
          {showPeople && event.people?.length ? <AvatarGroup people={event.people} max={3} size="sm" /> : null}
        </div>
        <VisuallyHidden>
          {[dateText, item.progress !== undefined ? config.labels.complete(item.progress) : ''].filter(Boolean).join('. ')}
        </VisuallyHidden>
      </div>
      <div className="m2t-gantt__track" aria-hidden="true">
        {span &&
          (span.milestone ? (
            <span className="m2t-gantt__milestone" data-status={item.status} style={barStyle} title={dateText} />
          ) : (
            <>
              <span className="m2t-gantt__bar" data-status={item.status} style={barStyle} title={dateText}>
                <span className="m2t-gantt__bar-fill" />
              </span>
              {item.progress !== undefined && item.status !== 'completed' && (
                <span className="m2t-gantt__bar-label" style={barStyle}>
                  {item.progress}%
                </span>
              )}
            </>
          ))}
      </div>
      {hasDetails(item) && config.expandable && (
        <div className="m2t-gantt__details">
          <Details item={item} open={expanded} />
        </div>
      )}
    </li>
  );
});

/**
 * A lightweight Gantt chart for project plans: tasks grouped into phases (`event.group`), bars with
 * progress, milestones (events without `endDate`), owners, status and a "today" line.
 */
export function GanttTimeline<TData = unknown>(props: GanttTimelineProps<TData>) {
  const { scale = 'auto', labelWidth, minWidth = 760, showPeople = true, locale = 'en-US' } = props;
  const tl = useTimeline(props, { groupBy: hasAnyGroup(props.events) ? 'group' : false });
  const labels = useLabels(props.labels);
  const clock = useNow();
  const todayProp = props.today;
  const today = todayProp === false ? null : todayProp !== undefined ? (parseDate(todayProp)?.time ?? null) : clock;

  const spans = useMemo(() => new Map(tl.visible.map((item) => [item.key, spanOf(item, today)])), [tl.visible, today]);

  const { domain, ticks, unit } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    spans.forEach((s) => {
      if (!s) return;
      min = Math.min(min, s.start);
      max = Math.max(max, s.end);
    });
    if (!Number.isFinite(min)) return { domain: null, ticks: [], unit: 'month' as Unit };
    const u: Unit = scale === 'auto' ? chooseUnit(max - min) : scale;
    const start = floorTo(min, u);
    let end = floorTo(max, u);
    if (end <= max) end = addUnit(end, u);
    const list: Array<{ t: number; label: string }> = [];
    for (let t = start, i = 0; t < end && i < 400; t = addUnit(t, u), i++) list.push({ t, label: tickLabel(t, u, i === 0, locale) });
    return { domain: [start, end] as [number, number], ticks: list, unit: u };
  }, [spans, scale, locale]);

  const flatIndex = useMemo(() => new Map(tl.visible.map((item, i) => [item.key, i])), [tl.visible]);
  const total = tl.visible.length;
  const d: [number, number] = domain ?? [0, 1];
  const todayPct = domain && today !== null && today >= d[0] && today <= d[1] ? pct(today, d) : null;

  const style = {
    '--m2t-gantt-label-w': labelWidth,
    '--m2t-gantt-min-w': `${minWidth}px`,
    '--m2t-gantt-ticks': ticks.length || 1,
  } as CSSProperties;

  return (
    <TimelineFrame {...props} controller={tl} layout="gantt" attrs={{ 'data-scale': unit }}>
      <div className="m2t-gantt" style={style}>
        <div className="m2t-gantt__scroll" tabIndex={0} role="group" aria-label={props['aria-label'] ?? labels.region}>
          <div className="m2t-gantt__grid">
            <div className="m2t-gantt__head" aria-hidden="true">
              <div className="m2t-gantt__corner" />
              <div className="m2t-gantt__scale">
                {ticks.map((tick, i) => (
                  <span
                    key={tick.t}
                    className="m2t-gantt__tick"
                    style={{ left: `${pct(tick.t, d)}%`, width: `${pct(ticks[i + 1]?.t ?? d[1], d) - pct(tick.t, d)}%` }}
                  >
                    {tick.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="m2t-gantt__body">
              <div className="m2t-gantt__lines" aria-hidden="true">
                {ticks.map((tick) => (
                  <span key={tick.t} style={{ left: `${pct(tick.t, d)}%` }} />
                ))}
              </div>
              {todayPct !== null && (
                <div className="m2t-gantt__overlay" aria-hidden="true">
                  <span className="m2t-gantt__today" style={{ left: `${todayPct}%` }}>
                    <span>{labels.today}</span>
                  </span>
                </div>
              )}
              {tl.groups.map((group) => {
                let gMin = Infinity;
                let gMax = -Infinity;
                for (const item of group.items) {
                  const s = spans.get(item.key);
                  if (s) {
                    gMin = Math.min(gMin, s.start);
                    gMax = Math.max(gMax, s.end);
                  }
                }
                const done = group.items.filter((i) => i.status === 'completed').length;
                return (
                  <div className="m2t-gantt__group" key={group.key} data-m2t-group={group.key}>
                    {group.label && (
                      <div className="m2t-gantt__phase">
                        <div className="m2t-gantt__label">
                          <GroupHeading className="m2t-gantt__phase-title">{group.label}</GroupHeading>
                          <span className="m2t-gantt__phase-count">
                            {done}/{group.items.length}
                          </span>
                        </div>
                        <div className="m2t-gantt__track" aria-hidden="true">
                          {Number.isFinite(gMin) && (
                            <span
                              className="m2t-gantt__phase-bar"
                              style={{ '--m2t-bar-start': pct(gMin, d), '--m2t-bar-width': pct(gMax, d) - pct(gMin, d) } as CSSProperties}
                            />
                          )}
                        </div>
                      </div>
                    )}
                    <ol className="m2t-gantt__rows">
                      {group.items.map((item) => (
                        <GanttRow
                          key={item.key}
                          item={item}
                          index={flatIndex.get(item.key) ?? 0}
                          total={total}
                          span={domain ? (spans.get(item.key) ?? null) : null}
                          domain={d}
                          active={tl.activeKey === item.key}
                          expanded={tl.isExpanded(item.key)}
                          showPeople={showPeople}
                        />
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TimelineFrame>
  );
}
