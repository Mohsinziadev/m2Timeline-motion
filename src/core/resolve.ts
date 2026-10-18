import type { TimelineEvent, TimelineGroup, TimelineGroupBy, TimelineItem, TimelineOrder, TimelineStatus } from '../types';
import { formatWith, parseDate } from './date';
import { clamp, isDev, warnOnce } from './env';

const STATUSES: ReadonlySet<string> = new Set<TimelineStatus>(['completed', 'current', 'upcoming', 'delayed', 'blocked', 'cancelled']);

function textOf(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return '';
}

/**
 * Validates and normalises raw events. Invalid input never throws: problems are reported once as
 * development warnings and the event is rendered as well as possible.
 */
export function resolveEvents<T>(events: ReadonlyArray<TimelineEvent<T>> | null | undefined): TimelineItem<T>[] {
  if (!Array.isArray(events)) {
    if (events != null) warnOnce('`events` must be an array. Received ' + typeof events + '.');
    return [];
  }

  const seen = new Map<string, number>();
  const items: TimelineItem<T>[] = [];

  events.forEach((event, i) => {
    if (!event || typeof event !== 'object') {
      warnOnce(`events[${i}] is not an object and was skipped.`);
      return;
    }

    let key: string;
    if (event.id === undefined || event.id === null || event.id === '') {
      key = `__m2t-${i}`;
      warnOnce(`events[${i}] is missing an \`id\`. Provide stable ids so expansion and active state survive updates.`);
    } else {
      key = String(event.id);
    }
    const dupes = seen.get(key);
    if (dupes !== undefined) {
      warnOnce(`Duplicate event id "${key}". Ids must be unique; a suffix was added.`);
      seen.set(key, dupes + 1);
      key = `${key}__${dupes + 1}`;
    } else {
      seen.set(key, 0);
    }

    const start = parseDate(event.date);
    if (event.date !== undefined && event.date !== null && event.date !== '' && !start) {
      warnOnce(`Event "${key}" has an invalid date: ${JSON.stringify(event.date)}.`);
    }
    const ongoing = event.endDate === 'present';
    const end = ongoing ? null : parseDate(event.endDate as Exclude<typeof event.endDate, 'present'>);
    if (start && end && end.time < start.time) {
      warnOnce(`Event "${key}" ends before it starts.`);
    }

    let status = event.status;
    if (status !== undefined && !STATUSES.has(status)) {
      warnOnce(`Event "${key}" has an unknown status "${String(status)}".`);
      status = undefined;
    }

    let progress: number | undefined;
    if (typeof event.progress === 'number' && Number.isFinite(event.progress)) {
      progress = Math.round(clamp(event.progress, 0, 100));
    }

    const searchText = [
      textOf(event.title),
      textOf(event.subtitle),
      textOf(event.description),
      textOf(event.location),
      event.category,
      event.group,
      event.version,
      event.searchText,
      ...(event.tags ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (isDev && !searchText && event.title != null && typeof event.title !== 'string') {
      // Not an error — just a hint so search keeps working with rich titles.
      warnOnce('Some events use non-string titles; add `searchText` to make them searchable.');
    }

    items.push({ key, event, index: 0, start, end, ongoing, status, progress, searchText });
  });

  return items;
}

/** Stable sort by start date. Undated events keep their relative order and go last. */
export function sortItems<T>(items: TimelineItem<T>[], order: TimelineOrder): TimelineItem<T>[] {
  let out = items;
  if (order !== 'none') {
    const dir = order === 'desc' ? -1 : 1;
    out = items
      .map((item, i) => ({ item, i }))
      .sort((a, b) => {
        const at = a.item.start?.time;
        const bt = b.item.start?.time;
        if (at === undefined && bt === undefined) return a.i - b.i;
        if (at === undefined) return 1;
        if (bt === undefined) return -1;
        return at === bt ? a.i - b.i : (at - bt) * dir;
      })
      .map(({ item }) => item);
  }
  return out.map((item, index) => (item.index === index ? item : { ...item, index }));
}

export interface FilterOptions {
  query?: string;
  categories?: ReadonlyArray<string>;
}

/** Every whitespace-separated term must appear somewhere in the event's searchable text. */
export function filterItems<T>(items: TimelineItem<T>[], { query, categories }: FilterOptions): TimelineItem<T>[] {
  const terms = (query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  const cats = categories && categories.length > 0 ? new Set(categories) : null;
  if (!terms.length && !cats) return items;
  return items.filter((item) => {
    if (cats && !(item.event.category && cats.has(item.event.category))) return false;
    return terms.every((term) => item.searchText.includes(term));
  });
}

export function collectCategories<T>(items: TimelineItem<T>[]): string[] {
  const out: string[] = [];
  for (const item of items) {
    const c = item.event.category;
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

interface GroupContext {
  locale?: string;
}

function groupKeyFor<T>(item: TimelineItem<T>, groupBy: Exclude<TimelineGroupBy<T>, false>, ctx: GroupContext): [string, string] | null {
  if (typeof groupBy === 'function') {
    const label = groupBy(item);
    return label ? [label, label] : null;
  }
  if (groupBy === 'category') return item.event.category ? [item.event.category, item.event.category] : null;
  if (groupBy === 'group') return item.event.group ? [item.event.group, item.event.group] : null;

  const date = item.start?.date;
  if (!date) return null;
  const year = date.getUTCFullYear();
  switch (groupBy) {
    case 'year':
      return [String(year), String(year)];
    case 'quarter': {
      const q = Math.floor(date.getUTCMonth() / 3) + 1;
      return [`${year}-Q${q}`, `Q${q} ${year}`];
    }
    case 'month':
      return [`${year}-${date.getUTCMonth()}`, formatWith(date, { year: 'numeric', month: 'long' }, ctx.locale)];
    case 'day':
      return [date.toISOString().slice(0, 10), formatWith(date, { year: 'numeric', month: 'short', day: 'numeric' }, ctx.locale)];
    default:
      return null;
  }
}

/**
 * Groups items in encounter order. Consecutive items with the same key share a group; items without
 * a key are placed in an unlabeled group so nothing is ever dropped.
 */
export function groupItems<T>(
  items: TimelineItem<T>[],
  groupBy: TimelineGroupBy<T> | undefined,
  ctx: GroupContext = {},
): TimelineGroup<T>[] {
  if (!groupBy) return [{ key: '__all', label: '', items }];
  const groups: TimelineGroup<T>[] = [];
  const byKey = new Map<string, TimelineGroup<T>>();
  for (const item of items) {
    const result = groupKeyFor(item, groupBy, ctx);
    const [key, label] = result ?? ['__ungrouped', ''];
    let group = byKey.get(key);
    if (!group) {
      group = { key, label, items: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
