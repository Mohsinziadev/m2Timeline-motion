'use client';

import { memo, useMemo, type ReactNode } from 'react';
import { useTimelineConfig } from '../components/context';
import { toMedia } from '../components/parts';
import { TimelineCard } from '../components/TimelineCard';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { monthsBetween } from '../core/date';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import { useNow } from '../hooks/utils';
import type { TimelineCommonProps, TimelineItem, TimelineLabels } from '../types';
import { useLabels } from './shared';

export interface CareerTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Show computed tenure ("2 yrs 3 mos"). Ongoing roles are measured after hydration. @default true */
  showDuration?: boolean;
}

interface Run {
  key: string;
  company: string | null;
  items: TimelineItem[];
}

/** Consecutive events with the same `group` (company) form one run. */
function toRuns(items: TimelineItem[]): Run[] {
  const runs: Run[] = [];
  for (const item of items) {
    const company = item.event.group || null;
    const last = runs[runs.length - 1];
    if (company && last && last.company === company) last.items.push(item);
    else runs.push({ key: item.key, company, items: [item] });
  }
  return runs;
}

function durationText(start: number | undefined, end: number | undefined | null, labels: TimelineLabels): string | null {
  if (start === undefined || end === undefined || end === null) return null;
  const months = monthsBetween(start, end);
  return labels.duration(Math.floor(months / 12), months % 12);
}

function endOf(item: TimelineItem, now: number | null): number | null {
  if (item.ongoing) return now;
  return item.end?.time ?? item.start?.time ?? null;
}

function Logo({ item, name }: { item: TimelineItem; name: string }) {
  const media = toMedia(item.event.image);
  let content: ReactNode;
  if (media) content = <img src={media.src} alt="" loading="lazy" decoding="async" />;
  else if (item.event.icon) content = item.event.icon;
  else content = <span>{name.trim().slice(0, 1).toUpperCase()}</span>;
  return (
    <span className="m2t-career__logo" aria-hidden="true">
      {content}
    </span>
  );
}

interface RoleProps {
  item: TimelineItem;
  index: number;
  total: number;
  active: boolean;
  expanded: boolean;
  duration: string | null;
  nested: boolean;
}

const Role = memo(function Role({ item, index, total, active, expanded, duration, nested }: RoleProps) {
  const { headingLevel } = useTimelineConfig();
  return (
    <TimelineCard
      item={item}
      index={index}
      total={total}
      active={active}
      expanded={expanded}
      hide={['image', ...(nested ? (['subtitle'] as const) : [])]}
      titleLevel={nested ? (Math.min(6, headingLevel + 1) as 3) : undefined}
      eyebrow={duration ? <span className="m2t-career__duration">{duration}</span> : undefined}
      className="m2t-card--plain"
    />
  );
});

/**
 * A résumé / experience timeline. Consecutive roles at the same company (`event.group`) are nested
 * under a single company header with total tenure, showing promotions at a glance.
 */
export function CareerTimeline<TData = unknown>(props: CareerTimelineProps<TData>) {
  const { showDuration = true } = props;
  const tl = useTimeline(props, { groupBy: false });
  const labels = useLabels(props.labels);
  const itemClass = props.classNames?.item;
  const now = useNow();
  const runs = useMemo(() => toRuns(tl.visible), [tl.visible]);
  const flatIndex = useMemo(() => new Map(tl.visible.map((item, i) => [item.key, i])), [tl.visible]);
  const total = tl.visible.length;
  const level = Math.min(6, props.headingLevel ?? 3) as 3;
  const CompanyHeading = `h${level}` as 'h3';

  return (
    <TimelineFrame {...props} controller={tl} layout="career">
      <ol className="m2t-career">
        {runs.map((run) => {
          const first = run.items[0];
          const nested = Boolean(run.company && run.items.length > 1);
          if (!nested) {
            const i = flatIndex.get(first.key) ?? 0;
            return (
              <li
                key={run.key}
                className={cx('m2t-career__entry', itemClass)}
                {...itemAttrs(first, i, { active: tl.activeKey === first.key })}
              >
                <Logo item={first} name={run.company ?? String(first.event.subtitle ?? first.event.title ?? '')} />
                <div className="m2t-career__body">
                  <Role
                    item={first}
                    index={i}
                    total={total}
                    active={tl.activeKey === first.key}
                    expanded={tl.isExpanded(first.key)}
                    duration={showDuration ? durationText(first.start?.time, endOf(first, now), labels) : null}
                    nested={false}
                  />
                </div>
              </li>
            );
          }
          const starts = run.items.map((i) => i.start?.time).filter((t): t is number => t !== undefined);
          const ends = run.items.map((i) => endOf(i, now));
          const companyEnd = ends.some((e) => e === null) ? null : Math.max(...(ends as number[]));
          const companyDuration = showDuration && starts.length ? durationText(Math.min(...starts), companyEnd, labels) : null;
          const location = run.items.find((i) => i.event.location)?.event.location;
          return (
            <li
              key={run.key}
              className="m2t-career__entry m2t-career__entry--group"
              {...itemAttrs(first, flatIndex.get(first.key) ?? 0, { track: false })}
              data-m2t-key={undefined}
            >
              <Logo item={first} name={run.company!} />
              <div className="m2t-career__body">
                <header className="m2t-career__company">
                  <CompanyHeading className="m2t-career__company-name">{run.company}</CompanyHeading>
                  <p className="m2t-career__company-meta">
                    {[companyDuration, labels.roles(run.items.length)].filter(Boolean).join(' · ')}
                    {location ? <span> · {location}</span> : null}
                  </p>
                </header>
                <ol className="m2t-career__roles">
                  {run.items.map((item) => {
                    const i = flatIndex.get(item.key) ?? 0;
                    return (
                      <li
                        key={item.key}
                        className={cx('m2t-career__role', itemClass)}
                        data-m2t-key={item.key}
                        data-m2t-track=""
                        data-status={item.status}
                        data-ongoing={item.ongoing ? '' : undefined}
                      >
                        <span className="m2t-career__dot" aria-hidden="true" />
                        <Role
                          item={item}
                          index={i}
                          total={total}
                          active={tl.activeKey === item.key}
                          expanded={tl.isExpanded(item.key)}
                          duration={showDuration ? durationText(item.start?.time, endOf(item, now), labels) : null}
                          nested
                        />
                      </li>
                    );
                  })}
                </ol>
              </div>
            </li>
          );
        })}
      </ol>
    </TimelineFrame>
  );
}
