import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { isBrowser } from '../core/env';

export const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

/** Returns a ref that always holds the latest value (updated before effects run). */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

/** A stable function identity that always calls the latest implementation. */
export function useStableCallback<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const ref = useLatest(fn);
  return useCallback((...args: A) => ref.current(...args), [ref]);
}

/**
 * Controlled / uncontrolled state. The component is controlled whenever `value !== undefined`
 * (so `null` is a valid controlled value).
 */
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T | (() => T),
  onChange?: (next: T) => void,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : internal;
  const currentRef = useLatest(current);
  const onChangeRef = useLatest(onChange);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(currentRef.current) : next;
      if (Object.is(resolved, currentRef.current)) return;
      if (!controlled) setInternal(resolved);
      currentRef.current = resolved;
      onChangeRef.current?.(resolved);
    },
    [controlled, currentRef, onChangeRef],
  );

  return [current, set];
}

/* ---- shared clock (hydration-safe "now") ---------------------------------------------------- */

let clockNow = 0;
let clockTimer: ReturnType<typeof setInterval> | undefined;
const clockListeners = new Set<() => void>();

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (!clockTimer) {
    clockNow = Date.now();
    clockTimer = setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, 60_000);
  }
  return () => {
    clockListeners.delete(listener);
    if (!clockListeners.size && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

const getClock = () => clockNow || (clockNow = Date.now());
const getServerClock = () => null;

/**
 * Current time in ms, refreshed every minute — or `null` during server rendering and hydration.
 * Anything time-relative ("3 hours ago", today markers, ongoing durations) renders only on the client,
 * which keeps server and client markup identical.
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribeClock, getClock, getServerClock);
}

/* ---- reduced motion ------------------------------------------------------------------------- */

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(listener: () => void) {
  if (!isBrowser || !window.matchMedia) return () => {};
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener?.('change', listener);
  return () => mql.removeEventListener?.('change', listener);
}

/** `true` when the user prefers reduced motion. Always `false` on the server. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => (isBrowser && window.matchMedia ? window.matchMedia(REDUCED_QUERY).matches : false),
    () => false,
  );
}

export function prefersReducedMotion(): boolean {
  return isBrowser && !!window.matchMedia && window.matchMedia(REDUCED_QUERY).matches;
}
