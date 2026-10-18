'use client';

import { memo, useMemo, useRef } from 'react';
import { useTimelineConfig } from '../components/context';
import { Media } from '../components/parts';
import { TimelineCard } from '../components/TimelineCard';
import { findItemElement, itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import { prefersReducedMotion } from '../hooks/utils';
import type { TimelineCommonProps, TimelineItem } from '../types';
import { useLabels } from './shared';

export interface StoryTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Sticky chapter navigation. @default true */
  showNavigation?: boolean;
  /** Reading-progress bar. @default true */
  showProgress?: boolean;
  /** Image side. @default 'alternate' */
  mediaPosition?: 'alternate' | 'left' | 'right';
}

const Chapter = memo(function Chapter({
  item,
  index,
  total,
  active,
  expanded,
  side,
}: {
  item: TimelineItem;
  index: number;
  total: number;
  active: boolean;
  expanded: boolean;
  side: 'left' | 'right';
}) {
  const { classNames } = useTimelineConfig();
  return (
    <li
      className={cx('m2t-chapter', classNames.item)}
      data-side={side}
      data-has-media={item.event.image ? '' : undefined}
      {...itemAttrs(item, index, { active })}
    >
      {item.event.image && (
        <div className="m2t-chapter__media">
          <Media image={item.event.image} eager={index === 0} />
        </div>
      )}
      <div className="m2t-chapter__content">
        <TimelineCard
          item={item}
          index={index}
          total={total}
          active={active}
          expanded={expanded}
          imagePlacement="none"
          className="m2t-card--plain"
          stretch={false}
          eyebrow={
            <span className="m2t-chapter__num" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
          }
        />
      </div>
    </li>
  );
});

/**
 * Scrollytelling: full-width chapters with large media, a sticky chapter navigator that follows
 * your scroll position, and a reading-progress bar. Expandable "read more" details per chapter.
 */
export function StoryTimeline<TData = unknown>(props: StoryTimelineProps<TData>) {
  const { showNavigation = true, showProgress = true, mediaPosition = 'alternate' } = props;
  const labels = useLabels(props.labels);
  const tl = useTimeline(props, { groupBy: false });
  const chaptersRef = useRef<HTMLOListElement>(null);
  const total = tl.visible.length;
  const sides = useMemo(
    () => tl.visible.map((_, i): 'left' | 'right' => (mediaPosition === 'alternate' ? (i % 2 ? 'right' : 'left') : mediaPosition)),
    [tl.visible, mediaPosition],
  );

  const goTo = (item: TimelineItem) => {
    const el = findItemElement(chaptersRef.current, item.key);
    el?.scrollIntoView?.({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    tl.setActiveKey(item.key, 'track');
  };

  return (
    <TimelineFrame
      {...props}
      trackActive={props.trackActive ?? true}
      scrollProgress={props.scrollProgress ?? showProgress}
      scrollTargetRef={chaptersRef}
      controller={tl}
      layout="story"
      scrollBlock="start"
    >
      {showProgress && (
        <div className="m2t-story__progress" aria-hidden="true">
          <span />
        </div>
      )}
      <div className="m2t-story" data-nav={showNavigation ? '' : undefined}>
        {showNavigation && total > 1 && (
          <nav className="m2t-story__nav" aria-label={labels.chapters}>
            <ol>
              {tl.visible.map((item, i) => (
                <li key={item.key}>
                  <button
                    type="button"
                    className="m2t-story__nav-btn"
                    aria-current={tl.activeKey === item.key ? 'true' : undefined}
                    onClick={() => goTo(item)}
                  >
                    <span className="m2t-story__nav-dot" aria-hidden="true" />
                    <span className="m2t-story__nav-num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="m2t-story__nav-title">{item.event.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <ol className="m2t-story__chapters" ref={chaptersRef}>
          {tl.visible.map((item, i) => (
            <Chapter
              key={item.key}
              item={item}
              index={i}
              total={total}
              active={tl.activeKey === item.key}
              expanded={tl.isExpanded(item.key)}
              side={sides[i]}
            />
          ))}
        </ol>
      </div>
    </TimelineFrame>
  );
}
