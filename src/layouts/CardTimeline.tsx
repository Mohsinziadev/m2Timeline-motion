'use client';

import { memo, type CSSProperties } from 'react';
import { useTimelineConfig } from '../components/context';
import { TimelineDate } from '../components/parts';
import { TimelineCard } from '../components/TimelineCard';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { TimelineMarker } from '../components/TimelineMarker';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import type { TimelineCommonProps, TimelineItem } from '../types';

export interface CardTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Minimum card width; the grid fits as many columns as possible. @default '17rem' */
  minCardWidth?: string;
}

const GridCard = memo(function GridCard({
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
    <li className={cx('m2t-cards__item', classNames.item)} {...itemAttrs(item, index, { active })}>
      <div className="m2t-cards__axis" aria-hidden="true">
        <TimelineMarker item={item} index={index} total={total} active={active} />
        <TimelineDate item={item} index={index} total={total} decorative className="m2t-cards__date" />
        <span className="m2t-cards__line" />
      </div>
      <TimelineCard item={item} index={index} total={total} active={active} expanded={expanded} dateVisuallyHidden />
    </li>
  );
});

/**
 * A responsive grid of rich event cards (cover images, metadata, people, actions) connected by a
 * timeline axis that runs through each row.
 */
export function CardTimeline<TData = unknown>(props: CardTimelineProps<TData>) {
  const { minCardWidth } = props;
  const tl = useTimeline(props, { groupBy: false });
  const total = tl.visible.length;
  return (
    <TimelineFrame {...props} controller={tl} layout="cards">
      <ol className="m2t-cards" style={minCardWidth ? ({ '--m2t-card-min': minCardWidth } as CSSProperties) : undefined}>
        {tl.visible.map((item, i) => (
          <GridCard
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
