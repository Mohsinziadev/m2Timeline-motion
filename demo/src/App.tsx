import { useEffect, useMemo, useState } from 'react';
import { SiteFooter, SiteHeader, Sidebar } from './components/site';
import { SECTION_IDS } from './docs-nav';
import { useScrollSpy } from './lib';
import { PackagePage } from './pages/PackagePage';
import { ProgressPage } from './pages/ProgressPage';
import { anchorFor, useRoute } from './router';

type SiteTheme = 'light' | 'dark';

export function App() {
  // Server render and hydration always start light; the saved / system theme applies after mount.
  const [theme, setTheme] = useState<SiteTheme>('light');
  const [route] = useRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useScrollSpy(useMemo(() => (route === 'package' ? SECTION_IDS : []), [route]));

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('m2t-site-theme');
    } catch {
      /* storage unavailable */
    }
    const initial =
      saved === 'dark' || saved === 'light' ? saved : window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved preference after hydration
    setTheme(initial);
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

  // Scroll to the hash target after the page for it has rendered (also for `#/playground`-style links).
  useEffect(() => {
    const scroll = () => {
      const anchor = anchorFor(window.location.hash);
      if (!anchor) {
        if (window.location.hash.startsWith('#/')) window.scrollTo({ top: 0 });
        return;
      }
      requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ block: 'start' }));
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
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((o) => !o)}
      />
      <div className="dlayout" data-route={route}>
        <Sidebar active={active} open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        {menuOpen && <button type="button" className="dscrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
        <main id="main" className="dmain" key={route}>
          {route === 'progress' ? <ProgressPage theme={theme} /> : <PackagePage theme={theme} active={active} />}
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
