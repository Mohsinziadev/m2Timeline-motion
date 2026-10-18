import { useCallback, useSyncExternalStore } from 'react';

/**
 * Two pages: the Timelines package page (`#/`) and the progress components page (`#/progress`).
 *
 * The package page has two views. Home is one landing page — hero, playground, layouts, progress,
 * quick start, accessibility and props — with in-page anchors. Docs is the full documentation with
 * its sidebar. Both are rendered into the HTML (the inactive one is hidden), so search engines and
 * no-JS readers get everything.
 *   #/  #playground  #layouts  #layout-…  #start  #a11y  #api   → home
 *   #/docs  #/docs/<id>  #docs-…  #api-…  #package             → docs
 * Older links (#/components, #/playground, #gallery, #overview, #/timelines) still land in the right place.
 * `#pg-…` anchors belong to the progress page.
 */
export type Route = 'package' | 'progress';
export type View = 'home' | 'docs';

/** Old view links → the home anchor that replaced them. */
const HOME_ALIASES: Record<string, string> = {
  components: 'layouts',
  timelines: 'layouts',
  gallery: 'layouts',
  playground: 'playground',
};

/** Which package-page view a hash shows. */
export function viewFor(hash: string): View {
  const h = decodeURIComponent(hash.replace(/^#\/?/, ''));
  return /^docs(\/|$)|^docs-|^api-|^package$/.test(h) ? 'docs' : 'home';
}

export function parseRoute(hash: string): Route {
  if (hash.startsWith('#/progress') || hash.startsWith('#pg-')) return 'progress';
  return 'package';
}

/** The element a hash should scroll to (null: the top of the view). */
export function anchorFor(hash: string): string | null {
  if (!hash.startsWith('#/')) {
    const id = hash.length > 1 ? decodeURIComponent(hash.slice(1)) : null;
    if (!id || id === 'overview') return null;
    return HOME_ALIASES[id] ?? id;
  }
  const [name, sub] = hash.slice(2).split('/');
  return sub ?? HOME_ALIASES[name] ?? null;
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

/** SSR-safe current view of the package page (the server renders home). */
export function useView(): View {
  return useSyncExternalStore(
    subscribe,
    () => viewFor(window.location.hash),
    (): View => 'home',
  );
}

export const href = (route: Route, anchor?: string) =>
  route === 'package' ? (anchor ? `#${anchor}` : '#/') : `#/${route}${anchor ? `/${anchor}` : ''}`;
