'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { useTimelineConfig } from '../components/context';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import { TimelineDate } from '../components/parts';
import { TimelineCard } from '../components/TimelineCard';
import { findItemElement, itemAttrs, TimelineFrame } from '../components/TimelineFrame';
import { TimelineMarker } from '../components/TimelineMarker';
import { cx } from '../core/env';
import { useTimeline } from '../hooks/useTimeline';
import { prefersReducedMotion, useIsomorphicLayoutEffect } from '../hooks/utils';
import type { TimelineCommonProps, TimelineItem } from '../types';
import { connectorFill, currentIndex, useLabels } from './shared';

export interface HorizontalTimelineProps<TData = unknown> extends TimelineCommonProps<TData> {
  /** Where cards sit relative to the line. @default 'below' */
  cardPosition?: 'below' | 'above' | 'alternate';
  /** Width of each item (any CSS length). @default 'clamp(15rem, 30vw, 19rem)' */
  itemWidth?: string | number;
  /** Previous / next buttons and the scroll indicator. @default true */
  showNavigation?: boolean;
  /** Initial scroll position. `current` centres the active or in-progress item. @default 'start' */
  startAt?: 'start' | 'end' | 'current';
  /** Click-and-drag scrolling with a mouse (touch and trackpads scroll natively). @default true */
  dragToScroll?: boolean;
}

interface ItemProps {
  item: TimelineItem;
  index: number;
  total: number;
  side: 'above' | 'below';
  active: boolean;
  expanded: boolean;
  filled: boolean;
  last: boolean;
}

const HorizontalItem = memo(function HorizontalItem({ item, index, total, side, active, expanded, filled, last }: ItemProps) {
  const { classNames } = useTimelineConfig();
  const card = <TimelineCard item={item} index={index} total={total} active={active} expanded={expanded} dateVisuallyHidden />;
  return (
    <li
      className={cx('m2t-hitem', classNames.item)}
      data-side={side}
      data-last={last ? '' : undefined}
      data-filled={filled ? '' : undefined}
      {...itemAttrs(item, index, { active })}
    >
      <div className="m2t-hitem__slot m2t-hitem__slot--above">{side === 'above' && card}</div>
      <div className="m2t-hitem__axis">
        <TimelineMarker item={item} index={index} total={total} active={active} />
        {!last && (
          <span className={cx('m2t-connector', classNames.connector)} aria-hidden="true">
            <span className="m2t-connector__fill" />
          </span>
        )}
        <TimelineDate item={item} index={index} total={total} decorative className="m2t-hitem__date" />
      </div>
      <div className="m2t-hitem__slot m2t-hitem__slot--below">{side === 'below' && card}</div>
    </li>
  );
});

/**
 * A horizontally scrolling timeline with scroll-snap, previous/next controls, a scroll indicator,
 * keyboard support (arrow keys, Home/End), native touch scrolling and optional mouse dragging.
 */
export function HorizontalTimeline<TData = unknown>(props: HorizontalTimelineProps<TData>) {
  const { cardPosition = 'below', itemWidth, showNavigation = true, startAt = 'start', dragToScroll = true } = props;
  const tl = useTimeline(props, { groupBy: false });
  const { visible } = tl;
  const fills = useMemo(() => connectorFill(visible), [visible]);
  const total = visible.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const updateEdges = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    const start = pos <= 2;
    const end = pos >= max - 2;
    indicatorRef.current?.style.setProperty('--m2t-h-progress', max > 0 ? (pos / max).toFixed(4) : '1');
    indicatorRef.current?.style.setProperty('--m2t-h-thumb', max > 0 ? (el.clientWidth / el.scrollWidth).toFixed(4) : '1');
    setEdges((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), updateEdges()));
    };
    updateEdges();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onScroll) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [updateEdges, total]);

  // Initial position, applied once before paint. Uses scrollLeft directly, so the page never scrolls.
  const initial = useRef({ startAt, activeKey: tl.activeKey, visible });
  useIsomorphicLayoutEffect(() => {
    const el = viewportRef.current;
    const { startAt: at, activeKey, visible: items } = initial.current;
    if (!el || at === 'start') return;
    if (at === 'end') {
      el.scrollLeft = el.scrollWidth;
      return;
    }
    const i = currentIndex(items);
    const key = activeKey ?? (i >= 0 ? items[i].key : null);
    if (key) centerItem(el, findItemElement(el, key), 'auto');
  }, []);

  const page = (dir: 1 | -1) => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollBy?.({ left: dir * el.clientWidth * 0.8, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const onViewportKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const el = e.currentTarget;
    const step = el.clientWidth * 0.5;
    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
    if (e.key === 'ArrowRight') el.scrollBy?.({ left: step, behavior });
    else if (e.key === 'ArrowLeft') el.scrollBy?.({ left: -step, behavior });
    else if (e.key === 'Home') el.scrollTo?.({ left: 0, behavior });
    else if (e.key === 'End') el.scrollTo?.({ left: el.scrollWidth, behavior });
    else return;
    e.preventDefault();
  };

  const drag = useRef<{ x: number; left: number; moved: boolean; id: number } | null>(null);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragToScroll || e.pointerType !== 'mouse' || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('a, button, input, select, textarea, [contenteditable]')) return;
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false, id: e.pointerId };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true;
      e.currentTarget.setPointerCapture?.(d.id);
      e.currentTarget.setAttribute('data-dragging', '');
    }
    if (d.moved) e.currentTarget.scrollLeft = d.left - dx;
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    const el = e.currentTarget;
    el.removeAttribute('data-dragging');
    el.releasePointerCapture?.(d.id);
    // Swallow the click that follows a drag so cards are not toggled accidentally.
    const swallow = (ev: Event) => {
      ev.stopPropagation();
      ev.preventDefault();
    };
    el.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => el.removeEventListener('click', swallow, { capture: true }), 0);
  };

  const labels = useLabels(props.labels);
  const widthValue = typeof itemWidth === 'number' ? `${itemWidth}px` : itemWidth;

  return (
    <TimelineFrame {...props} controller={tl} layout="horizontal" attrs={{ 'data-card-position': cardPosition }} scrollBlock="nearest">
      <div className="m2t-h" data-at-start={edges.start ? '' : undefined} data-at-end={edges.end ? '' : undefined}>
        <div
          ref={viewportRef}
          className="m2t-h__viewport"
          tabIndex={0}
          role="group"
          aria-label={props['aria-label'] ?? labels.region}
          aria-roledescription="scrollable timeline"
          onKeyDown={onViewportKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          data-draggable={dragToScroll ? '' : undefined}
        >
          <ol className="m2t-h__track" style={widthValue ? ({ '--m2t-h-item-w': widthValue } as CSSProperties) : undefined}>
            {visible.map((item, i) => (
              <HorizontalItem
                key={item.key}
                item={item}
                index={i}
                total={total}
                side={cardPosition === 'alternate' ? (i % 2 === 0 ? 'below' : 'above') : cardPosition}
                active={tl.activeKey === item.key}
                expanded={tl.isExpanded(item.key)}
                filled={fills[i]}
                last={i === total - 1}
              />
            ))}
          </ol>
        </div>
        {showNavigation && (
          <div className="m2t-h__nav">
            <button type="button" className="m2t-iconbtn" onClick={() => page(-1)} disabled={edges.start} aria-label={labels.previous}>
              <ChevronLeftIcon />
            </button>
            <span className="m2t-h__indicator" ref={indicatorRef} aria-hidden="true">
              <span className="m2t-h__thumb" />
            </span>
            <button type="button" className="m2t-iconbtn" onClick={() => page(1)} disabled={edges.end} aria-label={labels.next}>
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>
    </TimelineFrame>
  );
}

function centerItem(viewport: HTMLElement, el: HTMLElement | null, behavior: ScrollBehavior) {
  if (!el) return;
  const vp = viewport.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  viewport.scrollTo?.({ left: viewport.scrollLeft + (r.left - vp.left) - (vp.width - r.width) / 2, behavior });
}
