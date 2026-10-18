'use client';

import { memo, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useTimelineConfig } from '../components/context';
import { TimelineDate } from '../components/parts';
import { TimelineCard } from '../components/TimelineCard';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { TimelineMarker } from '../components/TimelineMarker';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import type { TimelineCommonProps, TimelineItem } from '../types';
import { connectorFill } from './shared';

export interface ZigzagTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Milestones per row on wide containers. @default 3 */
  columns?: 2 | 3 | 4;
  /** Minimum column width in px; fewer columns are used when the container is narrower. @default 240 */
  minColumnWidth?: number;
}

interface CellProps {
  item: TimelineItem;
  index: number;
  total: number;
  active: boolean;
  expanded: boolean;
  row: number;
  column: number;
  dir: 'ltr' | 'rtl';
  turn: boolean;
  last: boolean;
  filled: boolean;
}

const ZigzagCell = memo(function ZigzagCell({ item, index, total, active, expanded, row, column, dir, turn, last, filled }: CellProps) {
  const { classNames } = useTimelineConfig();
  return (
    <li
      className={cx('m2t-zz__item', classNames.item)}
      data-dir={dir}
      data-turn={turn ? '' : undefined}
      data-last={last ? '' : undefined}
      data-filled={filled ? '' : undefined}
      {...itemAttrs(item, index, { active, style: { gridRow: row + 1, gridColumn: column + 1 } })}
    >
      <div className="m2t-zz__axis">
        <TimelineMarker item={item} index={index} total={total} active={active} />
        <TimelineDate item={item} index={index} total={total} decorative className="m2t-zz__date" />
      </div>
      <TimelineCard item={item} index={index} total={total} active={active} expanded={expanded} dateVisuallyHidden />
    </li>
  );
});

/**
 * A serpentine ("snake") roadmap: milestones flow left-to-right, turn with a rounded connector, and
 * continue right-to-left on the next row. DOM order stays chronological; falls back to a single
 * column on narrow containers.
 */
export function ZigzagTimeline<TData = unknown>(props: ZigzagTimelineProps<TData>) {
  const { columns = 3, minColumnWidth = 240 } = props;
  const tl = useTimeline(props, { groupBy: false });
  const total = tl.visible.length;
  const fills = useMemo(() => connectorFill(tl.visible), [tl.visible]);
  const listRef = useRef<HTMLOListElement>(null);
  const [fit, setFit] = useState<number>(columns);

  useEffect(() => {
    const el = listRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setFit(Math.max(1, Math.min(columns, Math.floor(width / minColumnWidth))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [columns, minColumnWidth]);

  const cols = Math.min(columns, fit);
  const rows = Math.ceil(total / cols);

  return (
    <TimelineFrame {...props} controller={tl} layout="zigzag">
      <ol ref={listRef} className="m2t-zz" data-cols={cols} style={{ '--m2t-zz-cols': cols, '--m2t-zz-rows': rows } as CSSProperties}>
        {tl.visible.map((item, i) => {
          const row = Math.floor(i / cols);
          const pos = i % cols;
          const dir = row % 2 === 0 ? 'ltr' : 'rtl';
          const column = dir === 'ltr' ? pos : cols - 1 - pos;
          const last = i === total - 1;
          return (
            <ZigzagCell
              key={item.key}
              item={item}
              index={i}
              total={total}
              active={tl.activeKey === item.key}
              expanded={tl.isExpanded(item.key)}
              row={row}
              column={column}
              dir={dir}
              turn={pos === cols - 1 && !last && cols > 1}
              last={last}
              filled={fills[i]}
            />
          );
        })}
      </ol>
    </TimelineFrame>
  );
}
