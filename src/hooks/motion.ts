import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from './utils';

export const REVEAL_ATTR = 'data-m2t-reveal';
export const INVIEW_ATTR = 'data-m2t-inview';

interface RevealOptions {
  enabled: boolean;
  once: boolean;
  stagger: number;
  /** Reveal duration in ms; the stagger delay is cleared afterwards so hover transitions stay instant. */
  duration: number;
  /** Changes whenever the rendered item set changes, so new elements get observed. */
  signal: string;
}

/**
 * Scroll-reveal driven by a single IntersectionObserver per timeline. Visibility is written straight
 * to DOM attributes, so scrolling never causes React re-renders. Items entering together are
 * staggered via the `--m2t-delay` custom property.
 */
export function useReveal(rootRef: RefObject<HTMLElement | null>, { enabled, once, stagger, duration, signal }: RevealOptions) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.setAttribute('data-m2t-ready', '');

    const targets = Array.from(root.querySelectorAll<HTMLElement>(`[${REVEAL_ATTR}]`));
    const showAll = () => targets.forEach((el) => el.setAttribute(INVIEW_ATTR, ''));

    if (!enabled || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      showAll();
      return;
    }

    const timers = new Set<ReturnType<typeof setTimeout>>();
    const observer = new IntersectionObserver(
      (entries) => {
        let batch = 0;
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            const delay = Math.min(batch, 8) * stagger;
            el.style.setProperty('--m2t-delay', `${delay}ms`);
            batch += 1;
            el.setAttribute(INVIEW_ATTR, '');
            const timer = setTimeout(
              () => {
                timers.delete(timer);
                el.style.removeProperty('--m2t-delay');
              },
              delay + duration * 1.6 + 400,
            );
            timers.add(timer);
            if (once) observer.unobserve(el);
          } else if (!once) {
            el.removeAttribute(INVIEW_ATTR);
            el.style.removeProperty('--m2t-delay');
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0 },
    );

    for (const el of targets) {
      if (!once || !el.hasAttribute(INVIEW_ATTR)) observer.observe(el);
    }
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [rootRef, enabled, once, stagger, duration, signal]);
}

/**
 * Writes the scroll progress (0–1) of `targetRef` through the viewport centre into the
 * `--m2t-scroll` custom property on the root. One passive listener, throttled to animation frames.
 */
export function useScrollProgress(
  rootRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null> | undefined,
  enabled: boolean,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const target = targetRef?.current ?? root;
      const rect = target.getBoundingClientRect();
      const anchor = window.innerHeight * 0.55;
      const value = rect.height > 0 ? Math.min(1, Math.max(0, (anchor - rect.top) / rect.height)) : 0;
      root.style.setProperty('--m2t-scroll', value.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    // Capture phase: also reacts when the timeline lives inside a scrollable panel, not just the page.
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [rootRef, targetRef, enabled]);
}

/**
 * Reports the item crossing the middle band of the viewport (scroll-spy).
 */
export function useActiveTracking(
  rootRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onActive: (key: string) => void,
  signal: string,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const key = (entry.target as HTMLElement).getAttribute('data-m2t-key');
            if (key !== null) onActive(key);
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    root.querySelectorAll('[data-m2t-track]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootRef, enabled, onActive, signal]);
}
