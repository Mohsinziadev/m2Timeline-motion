'use client';

import { memo, useMemo } from 'react';
import { useTimelineConfig } from '../components/context';
import { TimelineCard } from '../components/TimelineCard';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { TimelineMarker } from '../components/TimelineMarker';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import type { TimelineCommonProps, TimelineItem } from '../types';
import { GroupHeading, hasAnyGroup } from './shared';

export interface HistoryTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Keep the era / year heading pinned while its events scroll by. @default true */
  stickyLabels?: boolean;
}

const HistoryEvent = memo(function HistoryEvent({
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
    <li className={cx('m2t-history__event', classNames.item)} {...itemAttrs(item, index, { active })}>
      <TimelineMarker item={item} index={index} total={total} active={active} />
      <TimelineCard
        item={item}
        index={index}
        total={total}
        active={active}
        expanded={expanded}
        imagePlacement="inline"
        className="m2t-card--plain"
      />
    </li>
  );
});

/**
 * An editorial history timeline: large era / year headings that stay pinned while their events
 * scroll past, with generous media and typographic rhythm. Groups by `event.group` when present,
 * otherwise by year.
 */
export function HistoryTimeline<TData = unknown>(props: HistoryTimelineProps<TData>) {
  const { stickyLabels = true } = props;
  const tl = useTimeline(props, { groupBy: hasAnyGroup(props.events) ? 'group' : 'year' });
  const flatIndex = useMemo(() => new Map(tl.visible.map((item, i) => [item.key, i])), [tl.visible]);
  const total = tl.visible.length;

  return (
    <TimelineFrame {...props} controller={tl} layout="history" attrs={{ 'data-sticky': stickyLabels ? '' : undefined }}>
      <div className="m2t-history">
        {tl.groups.map((group) => (
          <section className="m2t-history__era" key={group.key} data-m2t-group={group.key} aria-label={group.label || undefined}>
            <div className="m2t-history__label">
              {group.label && <GroupHeading className="m2t-history__year">{group.label}</GroupHeading>}
            </div>
            <ol className="m2t-history__events">
              {group.items.map((item) => (
                <HistoryEvent
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
