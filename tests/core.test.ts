import { describe, expect, it, vi } from 'vitest';
import { formatParsedDate, formatRelative, monthsBetween, parseDate } from '../src/core/date';
import { filterItems, groupItems, resolveEvents, sortItems } from '../src/core/resolve';
import { detectBump } from '../src/core/semver';

describe('parseDate', () => {
  it('parses ISO date strings as UTC with precision', () => {
    expect(parseDate('2024')).toMatchObject({ precision: 'year', time: Date.UTC(2024, 0, 1) });
    expect(parseDate('2024-03')).toMatchObject({ precision: 'month', time: Date.UTC(2024, 2, 1) });
    expect(parseDate('2024-03-18')).toMatchObject({ precision: 'day', time: Date.UTC(2024, 2, 18) });
    expect(parseDate('2024-03-18T10:30:00Z')?.precision).toBe('time');
  });

  it('treats small integers as years and large numbers as timestamps', () => {
    expect(parseDate(1969)).toMatchObject({ precision: 'year', time: Date.UTC(1969, 0, 1) });
    expect(parseDate(-500)?.date.getUTCFullYear()).toBe(-500);
    expect(parseDate(1_700_000_000_000)?.precision).toBe('time');
  });

  it('returns null for invalid input', () => {
    expect(parseDate('nope')).toBeNull();
    expect(parseDate('2024-13-01')).toBeNull();
    expect(parseDate(new Date('invalid'))).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate(Number.NaN)).toBeNull();
  });
});

describe('formatting', () => {
  it('formats at natural precision, independent of the host time zone', () => {
    expect(formatParsedDate(parseDate('2024')!)).toBe('2024');
    expect(formatParsedDate(parseDate('2024-03')!)).toBe('Mar 2024');
    expect(formatParsedDate(parseDate('2024-03-01')!)).toBe('Mar 1, 2024');
  });

  it('supports locales', () => {
    expect(formatParsedDate(parseDate('2024-03-01')!, { locale: 'de-DE' })).toBe('1. März 2024');
  });

  it('computes durations and relative times', () => {
    expect(monthsBetween(Date.UTC(2020, 0, 1), Date.UTC(2021, 2, 1))).toBe(15);
    const now = Date.UTC(2025, 0, 10, 12);
    expect(formatRelative(now - 3 * 36e5, now)).toBe('3 hours ago');
    expect(formatRelative(now - 24 * 36e5, now)).toBe('yesterday');
  });
});

describe('resolveEvents', () => {
  it('handles missing and duplicate ids without throwing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const items = resolveEvents([{ id: 'a', title: 'A' }, { id: 'a', title: 'A again' }, { title: 'No id' } as never]);
    expect(items.map((i) => i.key)).toEqual(['a', 'a__1', '__m2t-2']);
    expect(warn).toHaveBeenCalled();
  });

  it('ignores non-array input and non-object entries', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveEvents(null)).toEqual([]);
    expect(resolveEvents('x' as never)).toEqual([]);
    expect(resolveEvents([null as never, { id: 1, title: 'ok' }])).toHaveLength(1);
  });

  it('clamps progress and drops unknown statuses', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const [item] = resolveEvents([{ id: 1, title: 'x', progress: 140, status: 'weird' as never }]);
    expect(item.progress).toBe(100);
    expect(item.status).toBeUndefined();
  });

  it('marks ongoing ranges', () => {
    const [item] = resolveEvents([{ id: 1, title: 'Role', date: '2022-05', endDate: 'present' }]);
    expect(item.ongoing).toBe(true);
    expect(item.end).toBeNull();
  });
});

describe('sorting, filtering, grouping', () => {
  const items = resolveEvents([
    { id: 'b', title: 'Beta launch', date: '2024-06-01', category: 'Launch' },
    { id: 'x', title: 'Undated note' },
    { id: 'a', title: 'Alpha', date: '2023-02-01', category: 'Build', tags: ['core'] },
    { id: 'c', title: 'GA', date: '2024-11-20', category: 'Launch' },
  ]);

  it('sorts ascending and descending, keeping undated last', () => {
    expect(sortItems(items, 'asc').map((i) => i.key)).toEqual(['a', 'b', 'c', 'x']);
    expect(sortItems(items, 'desc').map((i) => i.key)).toEqual(['c', 'b', 'a', 'x']);
    expect(sortItems(items, 'none').map((i) => i.key)).toEqual(['b', 'x', 'a', 'c']);
  });

  it('filters by every search term and by category', () => {
    expect(filterItems(items, { query: 'launch beta' }).map((i) => i.key)).toEqual(['b']);
    expect(filterItems(items, { query: 'core' }).map((i) => i.key)).toEqual(['a']);
    expect(filterItems(items, { categories: ['Launch'] }).map((i) => i.key)).toEqual(['b', 'c']);
  });

  it('groups by year, quarter and custom functions', () => {
    const sorted = sortItems(items, 'asc');
    expect(groupItems(sorted, 'year').map((g) => g.label)).toEqual(['2023', '2024', '']);
    expect(groupItems(sorted, 'quarter').map((g) => g.label)).toEqual(['Q1 2023', 'Q2 2024', 'Q4 2024', '']);
    expect(groupItems(sorted, (i) => (i.event.category ? `#${i.event.category}` : null)).map((g) => g.label)).toEqual([
      '#Build',
      '#Launch',
      '',
    ]);
  });
});

describe('detectBump', () => {
  it('classifies semver bumps', () => {
    expect(detectBump('2.0.0', '1.4.2')).toBe('major');
    expect(detectBump('1.5.0', '1.4.2')).toBe('minor');
    expect(detectBump('v1.4.3', '1.4.2')).toBe('patch');
    expect(detectBump('2.0.0-beta.1', '1.4.2')).toBe('prerelease');
    expect(detectBump('1.0.0', undefined)).toBe('major');
    expect(detectBump('not-a-version', '1.0.0')).toBeNull();
  });
});
