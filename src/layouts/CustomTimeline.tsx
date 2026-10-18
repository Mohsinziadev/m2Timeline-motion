'use client';

import { memo, type ReactNode } from 'react';
import { makeRenderContext, useTimelineConfig } from '../components/context';
import { TimelineDate, TimelineTitle } from '../components/parts';
import { TimelineCard } from '../components/TimelineCard';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { TimelineMarker } from '../components/TimelineMarker';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import type { TimelineCommonProps, TimelineItem, TimelineRenderContext } from '../types';
import { connectorFill } from './shared';

export interface CustomItemContext<TData = unknown> extends TimelineRenderContext<TData> {
  /** `true` when the connector leaving this item should render as travelled. */
  filled: boolean;
  /** Ready-made parts you can place anywhere. */
  parts: {
    marker: ReactNode;
    card: ReactNode;
    date: ReactNode;
    title: ReactNode;
    connector: ReactNode;
  };
}

export interface CustomTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Renders the content of each list item. Wrap-around reveal animation is applied automatically. */
  renderItem: (item: TimelineItem<TData>, ctx: CustomItemContext<TData>) => ReactNode;
  /** Class for the `<ol>`. Style it however you like (grid, flex, absolute positioning...). */
  listClassName?: string;
  /** Class (or function returning one) for each `<li>`. */
  itemClassName?: string | ((item: TimelineItem<TData>, index: number) => string | undefined);
  /** Layout name used for `data-layout` and the root class. @default 'custom' */
  layoutName?: string;
}

interface CustomItemProps {
  item: TimelineItem;
  index: number;
  total: number;
  active: boolean;
  expanded: boolean;
  filled: boolean;
  className?: string;
  render: CustomTimelineProps['renderItem'];
}

const CustomItem = memo(function CustomItem({ item, index, total, active, expanded, filled, className, render }: CustomItemProps) {
  const config = useTimelineConfig();
  const base = makeRenderContext(item, index, total, active, expanded, config);
  const ctx: CustomItemContext = {
    ...base,
    filled,
    parts: {
      marker: <TimelineMarker item={item} index={index} total={total} active={active} />,
      card: <TimelineCard item={item} index={index} total={total} active={active} expanded={expanded} />,
      date: <TimelineDate item={item} index={index} total={total} />,
      title: <TimelineTitle item={item} index={index} expanded={expanded} stretch={false} />,
      connector:
        index < total - 1 ? (
          <span className="m2t-connector" aria-hidden="true">
            <span className="m2t-connector__fill" />
          </span>
        ) : null,
    },
  };
  return (
    <li
      className={cx('m2t-custom__item', config.classNames.item, className)}
      data-filled={filled ? '' : undefined}
      {...itemAttrs(item, index, { active })}
    >
      {render(item, ctx)}
    </li>
  );
});

/**
 * Bring-your-own layout with all of the engine features (data validation, ordering, search,
 * filters, expansion, active tracking, scroll reveal, theming, keyboard navigation).
 */
export function CustomTimeline<TData = unknown>(props: CustomTimelineProps<TData>) {
  const { renderItem, listClassName, itemClassName, layoutName = 'custom' } = props;
  const tl = useTimeline(props, { groupBy: false });
  const total = tl.visible.length;
  const fills = connectorFill(tl.visible);
  return (
    <TimelineFrame {...props} controller={tl} layout={layoutName}>
      <ol className={cx('m2t-custom', listClassName)}>
        {tl.visible.map((item, i) => (
          <CustomItem
            key={item.key}
            item={item}
            index={i}
            total={total}
            active={tl.activeKey === item.key}
            expanded={tl.isExpanded(item.key)}
            filled={fills[i]}
            className={typeof itemClassName === 'function' ? itemClassName(item, i) : itemClassName}
            render={renderItem as CustomTimelineProps['renderItem']}
          />
        ))}
      </ol>
    </TimelineFrame>
  );
}
