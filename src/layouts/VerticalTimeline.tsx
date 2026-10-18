'use client';

import { memo, useMemo, useRef } from 'react';
import { useTimelineConfig } from '../components/context';
import { TimelineDate } from '../components/parts';
import { TimelineCard } from '../components/TimelineCard';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { TimelineMarker } from '../components/TimelineMarker';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import type { TimelineCommonProps, TimelineItem } from '../types';
import { connectorFill, GroupHeading } from './shared';

export interface VerticalTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Which side of the line the cards sit on. `alternate` zig-zags around a centred line. @default 'left' */
  align?: 'left' | 'right' | 'alternate';
  /**
   * `opposite` moves the date to the other side of the line (defaults to `opposite` for
   * `alternate`, `card` otherwise). Collapses into the card on narrow containers.
   */
  datePlacement?: 'card' | 'opposite';
  /** First card side for `align="alternate"`. @default 'right' */
  startSide?: 'left' | 'right';
}

interface ItemProps {
  item: TimelineItem;
  index: number;
  total: number;
  side: 'left' | 'right';
  active: boolean;
  expanded: boolean;
  filled: boolean;
  last: boolean;
  opposite: boolean;
}

const VerticalItem = memo(function VerticalItem({ item, index, total, side, active, expanded, filled, last, opposite }: ItemProps) {
  const { classNames } = useTimelineConfig();
  return (
    <li
      className={cx('m2t-item', classNames.item)}
      data-side={side}
      data-last={last ? '' : undefined}
      data-filled={filled ? '' : undefined}
      {...itemAttrs(item, index, { active })}
    >
      {opposite && (
        <div className="m2t-item__opposite">
          <TimelineDate item={item} index={index} total={total} decorative />
        </div>
      )}
      <div className="m2t-item__rail">
        <TimelineMarker item={item} index={index} total={total} active={active} />
        {!last && (
          <span className={cx('m2t-connector', classNames.connector)} aria-hidden="true">
            <span className="m2t-connector__fill" />
          </span>
        )}
      </div>
      <div className="m2t-item__body">
        <TimelineCard item={item} index={index} total={total} active={active} expanded={expanded} dateVisuallyHidden={opposite} />
      </div>
    </li>
  );
});

/**
 * The classic timeline: a single line with cards on the left, right, or alternating sides.
 * Alternating timelines collapse to a single column in narrow containers.
 */
export function VerticalTimeline<TData = unknown>(props: VerticalTimelineProps<TData>) {
  const { align = 'left', startSide = 'right' } = props;
  const datePlacement = props.datePlacement ?? (align === 'alternate' ? 'opposite' : 'card');
  const tl = useTimeline(props, { groupBy: false });
  const { visible, groups } = tl;
  const fills = useMemo(() => connectorFill(visible), [visible]);
  const total = visible.length;
  const opposite = datePlacement === 'opposite';
  const flatIndex = useMemo(() => new Map(visible.map((item, i) => [item.key, i])), [visible]);
  const listRef = useRef<HTMLDivElement>(null);

  const sideFor = (i: number): 'left' | 'right' => {
    if (align === 'left') return 'right';
    if (align === 'right') return 'left';
    const first = startSide;
    return i % 2 === 0 ? first : first === 'right' ? 'left' : 'right';
  };

  return (
    <TimelineFrame
      {...props}
      controller={tl}
      layout="vertical"
      attrs={{ 'data-align': align, 'data-date-placement': datePlacement }}
      scrollTargetRef={listRef}
    >
      <div className="m2t-groups" ref={listRef}>
        {groups.map((group) => (
          <div className="m2t-group" key={group.key} data-m2t-group={group.key}>
            {group.label && (
              <div className="m2t-group__label">
                <GroupHeading className="m2t-group__title">{group.label}</GroupHeading>
              </div>
            )}
            <ol className="m2t-list">
              {group.items.map((item) => {
                const i = flatIndex.get(item.key) ?? 0;
                return (
                  <VerticalItem
                    key={item.key}
                    item={item}
                    index={i}
                    total={total}
                    side={sideFor(i)}
                    active={tl.activeKey === item.key}
                    expanded={tl.isExpanded(item.key)}
                    filled={fills[i]}
                    last={i === total - 1}
                    opposite={opposite}
                  />
                );
              })}
            </ol>
          </div>
        ))}
        {props.scrollProgress && <span className="m2t-scrollline" aria-hidden="true" />}
      </div>
    </TimelineFrame>
  );
}
