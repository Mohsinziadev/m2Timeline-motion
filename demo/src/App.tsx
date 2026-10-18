import { useEffect, useMemo, useState } from 'react';
import { SiteFooter, SiteHeader, Sidebar } from './components/site';
import { SECTION_IDS } from './docs-nav';
import { useScrollSpy } from './lib';
import { PackagePage } from './pages/PackagePage';
import { ProgressPage } from './pages/ProgressPage';
import { anchorFor, useRoute, useView, viewFor } from './router';

type SiteTheme = 'light' | 'dark';

/** Sections of the Docs view, for its scroll spy (the other views' sections are hidden while reading). */
const DOC_IDS = SECTION_IDS.filter((id) => viewFor(`#${id}`) === 'docs');

export function App() {
  // Server render and hydration always start light; the saved / system theme applies after mount.
  const [theme, setTheme] = useState<SiteTheme>('light');
  const [route] = useRoute();
  const view = useView();
  const [menuOpen, setMenuOpen] = useState(false);
  // The docs sidebar belongs to reading; Overview, Components and Playground get the full width.
  const withSidebar = route === 'progress' || view === 'docs';
  const active = useScrollSpy(useMemo(() => (route === 'package' && view === 'docs' ? DOC_IDS : []), [route, view]));

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('m2t-site-theme');
    } catch {
      /* storage unavailable */
    }
    // Light by default; only a visitor's own choice (the toggle) switches to dark.
    if (saved !== 'dark') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved preference after hydration
    setTheme('dark');
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('m2t-site-theme', theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

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
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
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
