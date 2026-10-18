'use client';

import { memo, useMemo, useRef, type CSSProperties } from 'react';
import { useTimelineConfig } from '../components/context';
import { InlineProgress } from '../components/parts';
import { TimelineCard } from '../components/TimelineCard';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import { prefersReducedMotion } from '../hooks/utils';
import type { TimelineCommonProps, TimelineGroup, TimelineItem } from '../types';
import { completionOf, GroupHeading, hasAnyGroup, useLabels } from './shared';

export interface RoadmapTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Overall progress track with one segment per phase. @default true */
  showOverview?: boolean;
  /** Minimum lane width (any CSS length). @default '17rem' */
  laneWidth?: string;
}

type LaneState = 'done' | 'active' | 'planned';

interface LaneSummary {
  group: TimelineGroup;
  state: LaneState;
  done: number;
  percent: number;
}

function summarize(group: TimelineGroup): LaneSummary {
  const done = group.items.filter((i) => i.status === 'completed').length;
  const percent = group.items.length ? Math.round(group.items.reduce((sum, i) => sum + completionOf(i), 0) / group.items.length) : 0;
  const state: LaneState =
    done === group.items.length && done > 0
      ? 'done'
      : group.items.some((i) => i.status === 'current' || i.status === 'delayed' || i.status === 'blocked' || i.status === 'completed')
        ? 'active'
        : 'planned';
  return { group, state, done, percent };
}

const RoadmapCard = memo(function RoadmapCard({
  item,
  index,
  total,
  active,
  expanded,
}: {
  item: TimelineItem;
  index: number;
  total: number;
  active: boolean;
  expanded: boolean;
}) {
  const { classNames } = useTimelineConfig();
  return (
    <li className={cx('m2t-lane__item', classNames.item)} {...itemAttrs(item, index, { active })}>
      <TimelineCard item={item} index={index} total={total} active={active} expanded={expanded} />
    </li>
  );
});

/**
 * A product / project roadmap: phases (quarters by default, or `event.group`) shown as lanes with
 * completion summaries, plus an overview track with overall progress and a "Now" indicator.
 */
export function RoadmapTimeline<TData = unknown>(props: RoadmapTimelineProps<TData>) {
  const { showOverview = true, laneWidth } = props;
  const tl = useTimeline(props, { groupBy: hasAnyGroup(props.events) ? 'group' : 'quarter' });
  const labels = useLabels(props.labels);
  const lanesRef = useRef<HTMLDivElement>(null);
  const summaries = useMemo(() => tl.groups.map(summarize), [tl.groups]);
  const flatIndex = useMemo(() => new Map(tl.visible.map((item, i) => [item.key, i])), [tl.visible]);
  const total = tl.visible.length;
  const overall = total ? Math.round(tl.visible.reduce((s, i) => s + completionOf(i), 0) / total) : 0;
  const doneCount = tl.visible.filter((i) => i.status === 'completed').length;
  const nowIndex = summaries.findIndex((s) => s.state === 'active');

  const scrollToLane = (key: string) => {
    const lane = lanesRef.current?.querySelector<HTMLElement>(`[data-m2t-group="${key.replace(/["\\]/g, '\\$&')}"]`);
    lane?.scrollIntoView?.({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
    lane?.querySelector<HTMLElement>('[data-m2t-nav]')?.focus({ preventScroll: true });
  };

  const overview = showOverview && summaries.length > 0 && total > 0 && (
    <div className="m2t-roadmap__overview">
      <div className="m2t-roadmap__summary">
        <span className="m2t-roadmap__percent" aria-label={labels.complete(overall)}>
          {overall}%
        </span>
        <span className="m2t-roadmap__caption">
          {doneCount}/{total} {labels.status.completed.toLowerCase()}
        </span>
      </div>
      <ol className="m2t-roadmap__phases">
        {summaries.map((s, i) => (
          <li
            key={s.group.key}
            className="m2t-roadmap__phase"
            data-state={s.state}
            style={{ '--m2t-phase-progress': s.percent / 100 } as CSSProperties}
          >
            <button type="button" className="m2t-roadmap__phase-btn" onClick={() => scrollToLane(s.group.key)}>
              <span className="m2t-roadmap__phase-bar" aria-hidden="true">
                <span />
              </span>
              <span className="m2t-roadmap__phase-label">
                {s.group.label || '—'}
                {i === nowIndex && <span className="m2t-now">{labels.now}</span>}
              </span>
              <span className="m2t-sr">{labels.complete(s.percent)}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );

  return (
    <TimelineFrame {...props} controller={tl} layout="roadmap" header={overview || undefined} scrollBlock="nearest">
      <div
        className="m2t-roadmap__lanes"
        ref={lanesRef}
        tabIndex={-1}
        style={laneWidth ? ({ '--m2t-lane-w': laneWidth } as CSSProperties) : undefined}
      >
        {summaries.map((s, i) => (
          <section
            key={s.group.key}
            className="m2t-lane"
            data-state={s.state}
            data-now={i === nowIndex ? '' : undefined}
            data-m2t-group={s.group.key}
            aria-label={s.group.label || undefined}
          >
            <header className="m2t-lane__header">
              <div className="m2t-lane__heading">
                <GroupHeading className="m2t-lane__title">{s.group.label || '—'}</GroupHeading>
                {i === nowIndex && <span className="m2t-now">{labels.now}</span>}
                <span className="m2t-lane__count">
                  {s.done}/{s.group.items.length}
                </span>
              </div>
              <InlineProgress value={s.percent} size="sm" showValue={false} label={labels.complete(s.percent)} />
            </header>
            <ol className="m2t-lane__list">
              {s.group.items.map((item) => (
                <RoadmapCard
                  key={item.key}
                  item={item}
                  index={flatIndex.get(item.key) ?? 0}
                  total={total}
                  active={tl.activeKey === item.key}
                  expanded={tl.isExpanded(item.key)}
                />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </TimelineFrame>
  );
}
