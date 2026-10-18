import type { DatePrecision, ParsedDate, TimelineDateInput } from '../types';

const DATE_ONLY = /^(-?\d{1,4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/;

/**
 * Parses any supported date input. Date-only strings and bare years are interpreted as UTC, so the
 * result is identical on the server and in the browser (no hydration mismatches).
 */
export function parseDate(input: TimelineDateInput | null | undefined): ParsedDate | null {
  if (input === null || input === undefined || input === '') return null;

  if (input instanceof Date) {
    const time = input.getTime();
    return Number.isNaN(time) ? null : { time, date: new Date(time), precision: 'time' };
  }

  if (typeof input === 'number') {
    if (!Number.isFinite(input)) return null;
    if (Number.isInteger(input) && input >= -9999 && input <= 9999) return fromParts(input, 1, 1, 'year');
    return { time: input, date: new Date(input), precision: 'time' };
  }

  if (typeof input === 'string') {
    const value = input.trim();
    const match = DATE_ONLY.exec(value);
    if (match) {
      const year = Number(match[1]);
      const month = match[2] ? Number(match[2]) : 1;
      const day = match[3] ? Number(match[3]) : 1;
      if (month < 1 || month > 12 || day < 1 || day > 31) return null;
      return fromParts(year, month, day, match[3] ? 'day' : match[2] ? 'month' : 'year');
    }
    const time = Date.parse(value);
    if (Number.isNaN(time)) return null;
    return { time, date: new Date(time), precision: 'time' };
  }

  return null;
}

function fromParts(year: number, month: number, day: number, precision: DatePrecision): ParsedDate {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  return { time: date.getTime(), date, precision };
}

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    try {
      formatter = new Intl.DateTimeFormat(locale, options);
    } catch {
      formatter = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' });
    }
    formatterCache.set(key, formatter);
  }
  return formatter;
}

const PRECISION_OPTIONS: Record<DatePrecision, Intl.DateTimeFormatOptions> = {
  year: { year: 'numeric' },
  month: { year: 'numeric', month: 'short' },
  day: { year: 'numeric', month: 'short', day: 'numeric' },
  time: { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
};

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
}

/** Formats a parsed date at its natural precision ("2024", "Mar 2024", "Mar 18, 2024"). */
export function formatParsedDate(parsed: ParsedDate, { locale = 'en-US', timeZone = 'UTC' }: DateFormatOptions = {}): string {
  // Year/month/day precision values are UTC calendar dates; never shift them by a time zone.
  const tz = parsed.precision === 'time' ? timeZone : 'UTC';
  return getFormatter(locale, { ...PRECISION_OPTIONS[parsed.precision], timeZone: tz }).format(parsed.date);
}

export function formatWith(date: Date, options: Intl.DateTimeFormatOptions, locale = 'en-US'): string {
  return getFormatter(locale, { timeZone: 'UTC', ...options }).format(date);
}

/** Whole months between two timestamps (inclusive of the starting month). */
export function monthsBetween(start: number, end: number): number {
  const a = new Date(start);
  const b = new Date(end);
  const months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth()) + 1;
  return Math.max(1, months);
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 36e5],
  ['month', 30 * 24 * 36e5],
  ['week', 7 * 24 * 36e5],
  ['day', 24 * 36e5],
  ['hour', 36e5],
  ['minute', 6e4],
];

/** "3 hours ago", "in 2 days". Only call on the client (after mount) to stay hydration-safe. */
export function formatRelative(time: number, now: number, locale = 'en-US'): string {
  const diff = time - now;
  const abs = Math.abs(diff);
  let rtf: Intl.RelativeTimeFormat;
  try {
    rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  } catch {
    rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });
  }
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return rtf.format(0, 'minute');
}

/** UTC calendar-day index, used for "Today" / "Yesterday" grouping. */
export function dayNumber(time: number): number {
  return Math.floor(time / (24 * 36e5));
}

export function toISO(parsed: ParsedDate): string {
  if (parsed.precision === 'time') return parsed.date.toISOString();
  const iso = parsed.date.toISOString().slice(0, 10);
  if (parsed.precision === 'year') return iso.slice(0, 4);
  if (parsed.precision === 'month') return iso.slice(0, 7);
  return iso;
}
