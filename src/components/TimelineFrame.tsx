'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { cx } from '../core/env';
import { resolveLabels } from '../core/labels';
import { useActiveTracking, useReveal, useScrollProgress } from '../hooks/motion';
import type { TimelineController } from '../hooks/useTimeline';
import { prefersReducedMotion, useLatest } from '../hooks/utils';
import type { TimelineCommonProps, TimelineGroup, TimelineItem, TimelineSlot } from '../types';
import { hasDetails, TimelineConfigContext, type TimelineConfig } from './context';
import { EmptyIcon } from './icons';
import { TimelineToolbar } from './TimelineToolbar';

export interface TimelineFrameProps<TData = unknown> extends TimelineCommonProps<TData> {
  controller: TimelineController<TData>;
  /** Layout name, exposed as `data-layout` and the `m2t--{layout}` class. */
  layout: string;
  /** Extra `data-*` attributes for layout-specific styling. */
  attrs?: Record<string, string | undefined>;
  children: ReactNode;
  /** Element whose scroll position drives `scrollProgress` (defaults to the root). */
  scrollTargetRef?: RefObject<HTMLElement | null>;
  /** `block` option used by auto-scroll and jump navigation. @default 'center' */
  scrollBlock?: ScrollLogicalPosition;
  /** Content rendered after the toolbar and before the list (e.g. a summary). */
  header?: ReactNode;
}

const NO_CLASSNAMES: Partial<Record<TimelineSlot, string>> = {};
const NAV_KEYS = new Set(['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']);

function escapeAttr(value: string) {
  return value.replace(/["\\]/g, '\\$&');
}

/** Finds the element rendered for an item key inside a timeline root. */
export function findItemElement(root: HTMLElement | null, key: string): HTMLElement | null {
  return root?.querySelector<HTMLElement>(`[data-m2t-key="${escapeAttr(key)}"]`) ?? null;
}

/**
 * The root shared by every layout: theming attributes, configuration context, toolbar, empty state,
 * "show more" pagination, scroll reveal, scroll progress, scroll-spy, auto-scroll and keyboard
 * navigation. Use it with `useTimeline` to build fully custom layouts.
 */
export function TimelineFrame<TData>(props: TimelineFrameProps<TData>) {
  const {
    controller: tl,
    layout,
    attrs,
    children,
    header,
    theme = 'auto',
    appearance = 'modern',
    accent,
    density = 'comfortable',
    radius,
    marker = 'dot',
    connector = 'solid',
    connectorAnimated = false,
    glow = true,
    animation = 'rise',
    duration = 600,
    stagger = 70,
    animateOnce = true,
    scrollProgress = false,
    expandable = true,
    trackActive = false,
    autoScroll = false,
    onEventClick,
    keyboardNavigation = true,
    search,
    filters,
    jumpTo,
    renderEvent,
    renderMarker,
    renderDate,
    formatDate,
    locale = 'en-US',
    timeZone = 'UTC',
    emptyState,
    labels: labelOverrides,
    headingLevel = 3,
    id,
    className,
    style,
    classNames = NO_CLASSNAMES,
    scrollTargetRef,
    scrollBlock = 'center',
  } = props;

  const reactId = useId();
  const idPrefix = id ?? `m2t-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const rootRef = useRef<HTMLElement | null>(null);
  const labels = useMemo(() => resolveLabels(labelOverrides), [labelOverrides]);
  const tlRef = useLatest(tl);
  const onEventClickRef = useLatest(onEventClick);
  const clickable = Boolean(onEventClick);
  const canExpand = expandable !== false;

  const config = useMemo<TimelineConfig>(
    () => ({
      labels,
      headingLevel,
      idPrefix,
      locale,
      timeZone,
      marker,
      expandable: canExpand,
      clickable,
      classNames,
      formatDate: formatDate as TimelineConfig['formatDate'],
      renderEvent: renderEvent as TimelineConfig['renderEvent'],
      renderMarker: renderMarker as TimelineConfig['renderMarker'],
      renderDate: renderDate as TimelineConfig['renderDate'],
      toggle: (key) => tlRef.current.toggleExpanded(key),
      select: (key) => tlRef.current.setActiveKey(key, 'user'),
      activate: (item, index, domEvent) => {
        if (item.event.disabled) return;
        const c = tlRef.current;
        c.setActiveKey(item.key, 'user');
        if (canExpand && hasDetails(item)) c.toggleExpanded(item.key);
        onEventClickRef.current?.(item.event as never, { item: item as TimelineItem<TData>, index, domEvent });
      },
    }),
    [
      labels,
      headingLevel,
      idPrefix,
      locale,
      timeZone,
      marker,
      canExpand,
      clickable,
      classNames,
      formatDate,
      renderEvent,
      renderMarker,
      renderDate,
      tlRef,
      onEventClickRef,
    ],
  );

  const signal = useMemo(() => tl.visible.map((i) => i.key).join('|'), [tl.visible]);

  useReveal(rootRef, { enabled: animation !== 'none', once: animateOnce, stagger, duration, signal });
  useScrollProgress(rootRef, scrollTargetRef, scrollProgress);
  const onTrack = useCallback((key: string) => tlRef.current.setActiveKey(key, 'track'), [tlRef]);
  useActiveTracking(rootRef, trackActive, onTrack, signal);

  const scrollToKey = useCallback(
    (key: string, block: ScrollLogicalPosition) => {
      const el = findItemElement(rootRef.current, key);
      el?.scrollIntoView?.({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block, inline: 'center' });
      return el;
    },
    [rootRef],
  );

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!autoScroll || !tl.activeKey || tl.activeSourceRef.current === 'track') return;
    scrollToKey(tl.activeKey, scrollBlock);
  }, [tl.activeKey, tl.activeSourceRef, autoScroll, scrollBlock, scrollToKey]);

  const onJump = useCallback(
    (group: TimelineGroup<TData>) => {
      const first = group.items[0];
      if (!first) return;
      const el = scrollToKey(first.key, scrollBlock === 'nearest' ? 'nearest' : 'start');
      el?.querySelector<HTMLElement>('[data-m2t-nav]')?.focus({ preventScroll: true });
    },
    [scrollToKey, scrollBlock],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!keyboardNavigation || !NAV_KEYS.has(e.key)) return;
    const target = e.target as HTMLElement;
    const root = rootRef.current;
    if (!root || !target.hasAttribute('data-m2t-nav')) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-m2t-nav]')).filter(
      (node) => node.closest('[data-m2t-root]') === root,
    );
    const i = nodes.indexOf(target);
    if (i < 0) return;
    let next = i;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = i + 1;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = i - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = nodes.length - 1;
    if (next === i || next < 0 || next >= nodes.length) return;
    e.preventDefault();
    nodes[next].focus();
  };

  const [accentFrom, accentTo] = Array.isArray(accent) ? accent : [accent, undefined];
  const rootStyle = {
    ...(accentFrom ? { '--m2t-accent': accentFrom } : null),
    ...(accentTo ? { '--m2t-accent-2': accentTo } : null),
    ...(radius !== undefined ? { '--m2t-radius': typeof radius === 'number' ? `${radius}px` : radius } : null),
    '--m2t-duration': `${Math.max(0, duration)}ms`,
    ...style,
  } as CSSProperties;

  const showToolbar = Boolean(search || filters || jumpTo);
  const isEmpty = tl.visible.length === 0;

  return (
    <TimelineConfigContext.Provider value={config}>
      <section
        ref={rootRef as RefObject<HTMLElement>}
        id={id}
        className={cx('m2t', `m2t--${layout}`, className, classNames.root)}
        data-m2t-root=""
        data-layout={layout}
        data-theme={theme}
        data-appearance={appearance}
        data-density={density}
        data-marker={marker}
        data-connector={connector}
        data-connector-animated={connectorAnimated ? '' : undefined}
        data-glow={glow ? '' : undefined}
        data-animation={animation === 'none' ? undefined : animation}
        data-scroll-progress={scrollProgress ? '' : undefined}
        {...attrs}
        style={rootStyle}
        aria-label={props['aria-labelledby'] ? undefined : (props['aria-label'] ?? labels.region)}
        aria-labelledby={props['aria-labelledby']}
        onKeyDown={onKeyDown}
      >
        {showToolbar && (
          <TimelineToolbar
            controller={tl}
            labels={labels}
            idPrefix={idPrefix}
            search={search}
            filters={filters}
            jumpTo={jumpTo}
            onJump={onJump}
            className={classNames.toolbar}
          />
        )}
        {header}
        {isEmpty ? (
          <div className={cx('m2t-empty', classNames.empty)} role="status">
            <EmptyIcon className="m2t-empty__icon" />
            {tl.items.length === 0 ? (
              <div className="m2t-empty__text">{emptyState ?? labels.empty}</div>
            ) : (
              <>
                <p className="m2t-empty__text">{labels.noResults}</p>
                {tl.isFiltering && (
                  <button type="button" className="m2t-button m2t-button--secondary" onClick={tl.clearFilters}>
                    {labels.clearFilters}
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          children
        )}
        {tl.hasMore && (
          <div className="m2t-more">
            <button type="button" className="m2t-button m2t-button--secondary" onClick={tl.showMore}>
              {labels.showMore(tl.remaining)}
            </button>
          </div>
        )}
      </section>
    </TimelineConfigContext.Provider>
  );
}

/** Data attributes + style shared by every item element. */
export function itemAttrs(item: TimelineItem, index: number, extra?: { active?: boolean; track?: boolean; style?: CSSProperties }) {
  return {
    'data-m2t-key': item.key,
    'data-m2t-reveal': '',
    'data-m2t-track': extra?.track === false ? undefined : '',
    'data-status': item.status,
    'data-active': extra?.active ? '' : undefined,
    'data-highlight': item.event.highlight ? '' : undefined,
    style: {
      '--m2t-i': index,
      ...(item.event.color ? { '--m2t-item-accent': item.event.color } : null),
      ...extra?.style,
    } as CSSProperties,
  };
}
