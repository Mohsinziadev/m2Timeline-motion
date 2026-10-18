import { useEffect, useMemo, useState } from 'react';
import { SiteFooter, SiteHeader, Sidebar } from './components/site';
import { SECTION_IDS } from './docs-nav';
import { useScrollSpy } from './lib';
import { PackagePage } from './pages/PackagePage';
import { ProgressPage } from './pages/ProgressPage';
import { anchorFor, useRoute, useView, viewFor } from './router';

type SiteTheme = 'light' | 'dark';

/** Only the theme toggle writes this; without it the page is dark, whatever the system setting. */
const THEME_KEY = 'm2t-theme-choice';

/** Sections of the Docs view, for its scroll spy (the other views' sections are hidden while reading). */
const DOC_IDS = SECTION_IDS.filter((id) => viewFor(`#${id}`) === 'docs');

export function App() {
  // Server render and hydration always start light; the saved / system theme applies after mount.
  // Server render and hydration start dark (the default); a saved light choice applies after mount.
  const [theme, setTheme] = useState<SiteTheme>('dark');
  const [route] = useRoute();
  const view = useView();
  const [menuOpen, setMenuOpen] = useState(false);
  // The docs sidebar belongs to reading; Overview, Components and Playground get the full width.
  const withSidebar = route === 'progress' || view === 'docs';
  const active = useScrollSpy(useMemo(() => (route === 'package' && view === 'docs' ? DOC_IDS : []), [route, view]));

  // Dark by default; only a visitor's own toggle choice (saved under its own key) switches to light.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch {
      /* storage unavailable */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved choice after hydration
    if (saved === 'light') setTheme('light');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage unavailable */
      }
      return next;
    });

  useEffect(() => {
    document.title =
      route === 'progress' ? 'Progress components · Timelines · m2timeline-motion' : 'Timelines: React timeline & progress components';
  }, [route]);

  // After the view for a hash has rendered, scroll to its target — or to the top for a view link.
  useEffect(() => {
    const scroll = () => {
      const anchor = anchorFor(window.location.hash);
      // Wait a frame after React has shown the view, so the target is visible and measurable.
      setTimeout(() =>
        requestAnimationFrame(() => {
          const el = anchor ? document.getElementById(anchor) : null;
          if (el) el.scrollIntoView({ block: 'start' });
          else if (window.location.hash) window.scrollTo({ top: 0 });
        }),
      );
    };
    scroll();
    window.addEventListener('hashchange', scroll);
    return () => window.removeEventListener('hashchange', scroll);
  }, [route]);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SiteHeader
        route={route}
        view={view}
        withSidebar={withSidebar}
        theme={theme}
        onToggleTheme={toggleTheme}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((o) => !o)}
      />
      <div className="dlayout" data-route={route} data-sidebar={withSidebar ? undefined : 'off'}>
        {withSidebar && <Sidebar active={active} open={menuOpen} onNavigate={() => setMenuOpen(false)} />}
        {withSidebar && menuOpen && (
          <button type="button" className="dscrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />
        )}
        <main id="main" className="dmain" key={route}>
          {route === 'progress' ? <ProgressPage theme={theme} /> : <PackagePage theme={theme} active={active} view={view} />}
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
