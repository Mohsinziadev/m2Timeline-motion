'use client';

import { memo, useMemo } from 'react';
import { getDateText, useTimelineConfig } from '../components/context';
import { TimelineCard } from '../components/TimelineCard';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { TimelineMarker } from '../components/TimelineMarker';
import { dayNumber, formatRelative, toISO } from '../core/date';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import { useNow } from '../hooks/utils';
import type { TimelineCommonProps, TimelineGroup, TimelineItem } from '../types';
import { GroupHeading, useLabels } from './shared';

export interface FeedTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Show "3 hours ago" style times (client-side, after hydration). @default true */
  relativeTime?: boolean;
}

function FeedTime({ item, relative, now }: { item: TimelineItem; relative: boolean; now: number | null }) {
  const config = useTimelineConfig();
  if (!item.start) return null;
  const absolute = getDateText(item, config);
  const showRelative = relative && now !== null && item.start.precision !== 'year';
  return (
    <time className="m2t-feed__time" dateTime={toISO(item.start)} title={showRelative ? absolute : undefined}>
      {showRelative ? formatRelative(item.start.time, now, config.locale) : absolute}
    </time>
  );
}

const FeedItem = memo(function FeedItem({
  item,
  index,
  total,
  active,
  expanded,
  relative,
  now,
}: {
  item: TimelineItem;
  index: number;
  total: number;
  active: boolean;
  expanded: boolean;
  relative: boolean;
  now: number | null;
}) {
  const { classNames } = useTimelineConfig();
  return (
    <li className={cx('m2t-feed__item', classNames.item)} {...itemAttrs(item, index, { active })}>
      <div className="m2t-feed__rail">
        <TimelineMarker item={item} index={index} total={total} active={active} size="md" />
      </div>
      <TimelineCard
        item={item}
        index={index}
        total={total}
        active={active}
        expanded={expanded}
        hide={['date', 'image', 'progress', 'changes']}
        className="m2t-card--plain"
        eyebrow={<FeedTime item={item} relative={relative} now={now} />}
      />
    </li>
  );
});

function dayLabel(group: TimelineGroup, now: number | null, today: string, yesterday: string): string {
  const first = group.items[0]?.start;
  if (now === null || !first || first.precision === 'year' || first.precision === 'month') return group.label;
  const diff = dayNumber(now) - dayNumber(first.time);
  if (diff === 0) return today;
  if (diff === 1) return yesterday;
  return group.label;
}

/**
 * A compact activity feed for dashboards: small icon markers, dense rows, relative times and
 * day headings ("Today", "Yesterday"). Pairs well with `order="desc"` and `pageSize`.
 */
export function FeedTimeline<TData = unknown>(props: FeedTimelineProps<TData>) {
  const { relativeTime = true } = props;
  const tl = useTimeline(props, { groupBy: 'day' });
  const labels = useLabels(props.labels);
  const now = useNow();
  const flatIndex = useMemo(() => new Map(tl.visible.map((item, i) => [item.key, i])), [tl.visible]);
  const total = tl.visible.length;

  return (
    <TimelineFrame density="compact" animation="fade" {...props} controller={tl} layout="feed">
      <div className="m2t-feed">
        {tl.groups.map((group) => (
          <div className="m2t-feed__group" key={group.key} data-m2t-group={group.key}>
            {group.label && <GroupHeading className="m2t-feed__day">{dayLabel(group, now, labels.today, labels.yesterday)}</GroupHeading>}
            <ol className="m2t-feed__list">
              {group.items.map((item) => (
                <FeedItem
                  key={item.key}
                  item={item}
                  index={flatIndex.get(item.key) ?? 0}
                  total={total}
                  active={tl.activeKey === item.key}
                  expanded={tl.isExpanded(item.key)}
                  relative={relativeTime}
                  now={now}
                />
              ))}
            </ol>
          </div>
        ))}
      </div>
    </TimelineFrame>
  );
}
