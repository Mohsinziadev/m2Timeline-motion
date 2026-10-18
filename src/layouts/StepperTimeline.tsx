'use client';

import { memo, useMemo, type CSSProperties } from 'react';
import { useTimelineConfig } from '../components/context';
import { CheckIcon } from '../components/icons';
import { InlineProgress } from '../components/parts';
import { TimelineCard } from '../components/TimelineCard';
import { itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { TimelineMarker } from '../components/TimelineMarker';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import type { TimelineCommonProps, TimelineItem } from '../types';
import { connectorFill, currentIndex, useLabels } from './shared';

export interface StepperTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** `horizontal` switches to vertical automatically in narrow containers. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical';
  /** "Step 3 of 5" summary with an overall progress bar. @default true */
  showSummary?: boolean;
}

const Step = memo(function Step({
  item,
  index,
  total,
  active,
  expanded,
  filled,
  last,
  isCurrent,
}: {
  item: TimelineItem;
  index: number;
  total: number;
  active: boolean;
  expanded: boolean;
  filled: boolean;
  last: boolean;
  isCurrent: boolean;
}) {
  const { classNames, marker } = useTimelineConfig();
  return (
    <li
      className={cx('m2t-step', classNames.item)}
      data-filled={filled ? '' : undefined}
      data-last={last ? '' : undefined}
      data-current={isCurrent ? '' : undefined}
      aria-current={isCurrent ? 'step' : undefined}
      {...itemAttrs(item, index, { active })}
    >
      <div className="m2t-step__head">
        <TimelineMarker
          item={item}
          index={index}
          total={total}
          active={active || isCurrent}
          shape={marker === 'dot' ? 'number' : marker}
          size="lg"
        >
          {item.status === 'completed' && !item.event.icon ? <CheckIcon /> : undefined}
        </TimelineMarker>
        {!last && (
          <span className={cx('m2t-connector', classNames.connector)} aria-hidden="true">
            <span className="m2t-connector__fill" />
          </span>
        )}
      </div>
      <TimelineCard
        item={item}
        index={index}
        total={total}
        active={active}
        expanded={expanded}
        hide={['image', 'meta', 'people', 'changes', 'badges', 'progress']}
        className="m2t-card--plain"
        stretch={false}
      />
    </li>
  );
});

/**
 * A progress stepper: numbered stages with completed / current / upcoming states, animated
 * connector fill, a pulsing current step and an overall progress summary. Ideal for onboarding,
 * order tracking and delivery pipelines.
 */
export function StepperTimeline<TData = unknown>(props: StepperTimelineProps<TData>) {
  const { orientation = 'horizontal', showSummary = true } = props;
  const tl = useTimeline(props, { groupBy: false });
  const labels = useLabels(props.labels);
  const total = tl.visible.length;
  const fills = useMemo(() => connectorFill(tl.visible), [tl.visible]);
  const current = currentIndex(tl.visible);
  const done = tl.visible.filter((i) => i.status === 'completed').length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  const summary =
    showSummary && total > 0 ? (
      <div className="m2t-stepper__summary">
        <span className="m2t-stepper__count">{current >= 0 ? labels.step(current + 1, total) : labels.status.completed}</span>
        <InlineProgress value={percent} size="sm" />
      </div>
    ) : undefined;

  return (
    <TimelineFrame {...props} controller={tl} layout="stepper" attrs={{ 'data-orientation': orientation }} header={summary}>
      <ol className="m2t-stepper" style={{ '--m2t-steps': total } as CSSProperties}>
        {tl.visible.map((item, i) => (
          <Step
            key={item.key}
            item={item}
            index={i}
            total={total}
            active={tl.activeKey === item.key}
            expanded={tl.isExpanded(item.key)}
            filled={fills[i]}
            last={i === total - 1}
            isCurrent={i === current}
          />
        ))}
      </ol>
    </TimelineFrame>
  );
}
