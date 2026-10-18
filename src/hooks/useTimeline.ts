import { useCallback, useDeferredValue, useMemo, useRef, useState } from 'react';
import { collectCategories, filterItems, groupItems, resolveEvents, sortItems } from '../core/resolve';
import type { TimelineCommonProps, TimelineGroup, TimelineGroupBy, TimelineItem } from '../types';
import { useControllable, useLatest } from './utils';

export type UseTimelineOptions<TData = unknown> = Pick<
  TimelineCommonProps<TData>,
  | 'events'
  | 'order'
  | 'groupBy'
  | 'locale'
  | 'query'
  | 'defaultQuery'
  | 'onQueryChange'
  | 'selectedCategories'
  | 'defaultSelectedCategories'
  | 'onCategoriesChange'
  | 'expandable'
  | 'expandedIds'
  | 'defaultExpandedIds'
  | 'onExpandedChange'
  | 'activeId'
  | 'defaultActiveId'
  | 'onActiveChange'
  | 'pageSize'
>;

export type ActiveSource = 'user' | 'track' | 'program';

export interface TimelineController<TData = unknown> {
  /** Every valid event, ordered. */
  items: TimelineItem<TData>[];
  /** Items after search and category filters. */
  filtered: TimelineItem<TData>[];
  /** Items currently rendered (after pagination). */
  visible: TimelineItem<TData>[];
  /** `visible`, grouped according to `groupBy`. */
  groups: TimelineGroup<TData>[];
  /** Groups computed over all filtered items (used by "jump to"). */
  allGroups: TimelineGroup<TData>[];
  categories: string[];
  query: string;
  setQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (category: string) => void;
  clearFilters: () => void;
  isFiltering: boolean;
  isExpanded: (key: string) => boolean;
  toggleExpanded: (key: string) => void;
  setExpanded: (key: string, open: boolean) => void;
  activeKey: string | null;
  setActiveKey: (key: string | null, source?: ActiveSource) => void;
  /** Where the last active change came from (used to avoid scroll feedback loops). */
  activeSourceRef: { current: ActiveSource };
  hasMore: boolean;
  remaining: number;
  showMore: () => void;
  getItem: (key: string) => TimelineItem<TData> | undefined;
}

const EMPTY: never[] = [];

/**
 * Headless timeline engine: validation, ordering, search, filtering, grouping, pagination, expansion
 * and active state. Every built-in layout uses it, and you can use it to build your own.
 */
export function useTimeline<TData = unknown>(
  options: UseTimelineOptions<TData>,
  defaults: { groupBy?: TimelineGroupBy<TData> } = {},
): TimelineController<TData> {
  const { events, order = 'none', groupBy = defaults.groupBy, locale, expandable = true, pageSize } = options;

  const resolved = useMemo(() => resolveEvents(events), [events]);
  const items = useMemo(() => sortItems(resolved, order), [resolved, order]);
  const byKey = useMemo(() => new Map(items.map((item) => [item.key, item])), [items]);
  const categories = useMemo(() => collectCategories(items), [items]);

  const [query, setQuery] = useControllable(options.query, options.defaultQuery ?? '', options.onQueryChange);

  const [selected, setSelectedRaw] = useControllable<ReadonlyArray<string>>(
    options.selectedCategories,
    options.defaultSelectedCategories ?? EMPTY,
    options.onCategoriesChange as ((c: ReadonlyArray<string>) => void) | undefined,
  );
  const selectedCategories = selected as string[];
  const setSelectedCategories = useCallback((c: string[]) => setSelectedRaw(c), [setSelectedRaw]);
  const toggleCategory = useCallback(
    (category: string) => setSelectedRaw((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category])),
    [setSelectedRaw],
  );

  // Typing stays responsive on very long timelines: filtering runs at a lower priority.
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(
    () => filterItems(items, { query: deferredQuery, categories: selectedCategories }),
    [items, deferredQuery, selectedCategories],
  );
  const isFiltering = query.trim() !== '' || selectedCategories.length > 0;

  const clearFilters = useCallback(() => {
    setQuery('');
    setSelectedRaw(EMPTY);
  }, [setQuery, setSelectedRaw]);

  /* ---- pagination ---- */
  const [limit, setLimit] = useState<number | null>(null);
  const effectiveLimit = pageSize && pageSize > 0 ? Math.max(limit ?? pageSize, pageSize) : Infinity;
  const visible = useMemo(
    () => (Number.isFinite(effectiveLimit) ? filtered.slice(0, effectiveLimit) : filtered),
    [filtered, effectiveLimit],
  );
  const remaining = filtered.length - visible.length;
  const showMore = useCallback(() => {
    if (pageSize && pageSize > 0) setLimit((l) => (l ?? pageSize) + pageSize);
  }, [pageSize]);

  const groups = useMemo(() => groupItems(visible, groupBy, { locale }), [visible, groupBy, locale]);
  const allGroups = useMemo(() => groupItems(filtered, groupBy, { locale }), [filtered, groupBy, locale]);

  /* ---- expansion ---- */
  const toKeys = (ids: ReadonlyArray<string | number> | undefined) => (ids ? ids.map(String) : undefined);
  const controlledExpanded = useMemo(() => toKeys(options.expandedIds), [options.expandedIds]);
  const byKeyRef = useLatest(byKey);
  const onExpandedChangeRef = useLatest(options.onExpandedChange);
  const [expandedKeys, setExpandedKeys] = useControllable<string[]>(
    controlledExpanded,
    () => toKeys(options.defaultExpandedIds) ?? [],
    (keys) => onExpandedChangeRef.current?.(keys.map((k) => byKeyRef.current.get(k)?.event.id ?? k)),
  );
  const expandedSet = useMemo(() => new Set(expandedKeys), [expandedKeys]);
  const isExpanded = useCallback((key: string) => expandedSet.has(key), [expandedSet]);
  const setExpanded = useCallback(
    (key: string, open: boolean) => {
      if (!expandable) return;
      setExpandedKeys((prev) => {
        const has = prev.includes(key);
        if (open === has) return prev;
        if (!open) return prev.filter((k) => k !== key);
        return expandable === 'single' ? [key] : [...prev, key];
      });
    },
    [expandable, setExpandedKeys],
  );
  const toggleExpanded = useCallback((key: string) => setExpanded(key, !expandedSet.has(key)), [setExpanded, expandedSet]);

  /* ---- active ---- */
  const onActiveChangeRef = useLatest(options.onActiveChange);
  const activeSourceRef = useRef<ActiveSource>('program');
  const [activeKey, setActiveKeyRaw] = useControllable<string | null>(
    options.activeId === undefined ? undefined : options.activeId === null ? null : String(options.activeId),
    () => (options.defaultActiveId == null ? null : String(options.defaultActiveId)),
    (key) => {
      const item = key === null ? undefined : byKeyRef.current.get(key);
      onActiveChangeRef.current?.(item ? item.event.id : key, item?.event ?? null);
    },
  );
  const setActiveKey = useCallback(
    (key: string | null, source: ActiveSource = 'user') => {
      activeSourceRef.current = source;
      setActiveKeyRaw(key);
    },
    [setActiveKeyRaw],
  );

  const getItem = useCallback((key: string) => byKeyRef.current.get(key), [byKeyRef]);

  return {
    items,
    filtered,
    visible,
    groups,
    allGroups,
    categories,
    query,
    setQuery,
    selectedCategories,
    setSelectedCategories,
    toggleCategory,
    clearFilters,
    isFiltering,
    isExpanded,
    toggleExpanded,
    setExpanded,
    activeKey,
    setActiveKey,
    activeSourceRef,
    hasMore: remaining > 0,
    remaining,
    showMore,
    getItem,
  };
}
