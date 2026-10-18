'use client';

import { memo } from 'react';
import { useTimelineConfig } from '../components/context';
import { TimelineDate } from '../components/parts';
import { TimelineCard } from '../components/TimelineCard';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { TimelineMarker } from '../components/TimelineMarker';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import type { TimelineCommonProps, TimelineItem } from '../types';

export type MinimalTimelineProps<TData = unknown> = TimelineCommonProps<TData>;

const MinimalItem = memo(function MinimalItem({
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
    <li className={cx('m2t-minimal__item', classNames.item)} {...itemAttrs(item, index, { active })}>
      <div className="m2t-minimal__date">
        <TimelineDate item={item} index={index} total={total} decorative />
      </div>
      <div className="m2t-minimal__rail">
        <TimelineMarker item={item} index={index} total={total} active={active} size="sm" />
      </div>
      <TimelineCard
        item={item}
        index={index}
        total={total}
        active={active}
        expanded={expanded}
        dateVisuallyHidden
        hide={['image', 'meta', 'people', 'changes', 'progress']}
        className="m2t-card--plain"
      />
    </li>
  );
});

/**
 * A quiet, typographic timeline for professional sites: dates in a tabular column, a hairline,
 * and text. No cards, no shadows.
 */
export function MinimalTimeline<TData = unknown>(props: MinimalTimelineProps<TData>) {
  const tl = useTimeline(props, { groupBy: false });
  const total = tl.visible.length;
  return (
    <TimelineFrame animation="fade" marker="dot" {...props} controller={tl} layout="minimal">
      <ol className="m2t-minimal">
        {tl.visible.map((item, i) => (
          <MinimalItem
            key={item.key}
            item={item}
            index={i}
            total={total}
            active={tl.activeKey === item.key}
            expanded={tl.isExpanded(item.key)}
          />
        ))}
      </ol>
    </TimelineFrame>
  );
}
