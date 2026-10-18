import { useCallback, useSyncExternalStore } from 'react';

/**
 * Two pages: the Timelines package page (`#/`, also reached by the older `#/timelines`, `#/playground`
 * and `#/docs` links, which scroll to their section) and the progress components page (`#/progress`).
 * In-page anchors (`#gallery`, `#docs-install`…) stay on the package page; `#pg-…` anchors belong to
 * the progress page.
 */
export type Route = 'package' | 'progress';

const SECTION_ROUTES: Record<string, string> = {
  timelines: 'gallery',
  playground: 'playground',
  docs: 'docs-introduction',
};

export function parseRoute(hash: string): Route {
  if (hash.startsWith('#/progress') || hash.startsWith('#pg-')) return 'progress';
  return 'package';
}

/** The element a hash should scroll to: `#/progress/pg-steps` → `pg-steps`, `#/playground` → `playground`. */
export function anchorFor(hash: string): string | null {
  if (!hash.startsWith('#/')) return hash.length > 1 ? decodeURIComponent(hash.slice(1)) : null;
  const [name, sub] = hash.slice(2).split('/');
  return sub ?? SECTION_ROUTES[name] ?? null;
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};

/** SSR-safe: the server (and hydration) render the package page, then the real hash takes over. */
export function useRoute(): [Route, (route: Route) => void] {
  const route = useSyncExternalStore(
    subscribe,
    () => parseRoute(window.location.hash),
    (): Route => 'package',
  );
  const navigate = useCallback((next: Route) => {
    window.location.hash = next === 'package' ? '#/' : `#/${next}`;
  }, []);
  return [route, navigate];
}

export const href = (route: Route, anchor?: string) =>
  route === 'package' ? (anchor ? `#${anchor}` : '#/') : `#/${route}${anchor ? `/${anchor}` : ''}`;
