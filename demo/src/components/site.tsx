import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { NAV, SEARCH_INDEX, type SearchEntry } from '../docs-nav';
import { Icon } from '../icons';
import { M2TOOLKIT, PACKAGES_URL, PKG, RELATED } from '../meta';
import type { Route, View } from '../router';
import { CopyButton } from './ui';

/* ---- docs search (combobox) ------------------------------------------------------------- */

export function DocSearch() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const results = useMemo<SearchEntry[]>(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return SEARCH_INDEX.filter((e) => terms.every((t) => e.keywords.includes(t))).slice(0, 8);
  }, [query]);

  // "/" or Cmd/Ctrl+K focuses the search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea, select, [contenteditable]');
      if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (entry: SearchEntry) => {
    window.location.hash = entry.target;
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const expanded = open && query.trim() !== '';
  return (
    <div className="dsearch">
      <Icon name="search" size={16} />
      <input
        ref={inputRef}
        className="dsearch__input"
        type="search"
        role="combobox"
        aria-label="Search documentation"
        aria-expanded={expanded}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-activedescendant={expanded && results[index] ? `${id}-opt-${index}` : undefined}
        placeholder="Search docs…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIndex((i) => Math.min(results.length - 1, i + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setIndex((i) => Math.max(0, i - 1));
          } else if (e.key === 'Enter' && results[index]) {
            e.preventDefault();
            go(results[index]);
          } else if (e.key === 'Escape') {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
      />
      <kbd className="dsearch__kbd" aria-hidden="true">
        /
      </kbd>
      {expanded && (
        <ul className="dsearch__list" id={`${id}-list`} role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <li className="dsearch__empty" role="option" aria-selected={false} aria-disabled="true">
              No matches for “{query}”
            </li>
          ) : (
            results.map((r, i) => (
              <li
                key={r.target}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === index}
                className="dsearch__opt"
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(r);
                }}
                onMouseEnter={() => setIndex(i)}
              >
                <span>{r.label}</span>
                <span className="dsearch__group">{r.group}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

/* ---- header ---------------------------------------------------------------------------------- */

/** Header links, in the order the landing page reads (Docs and Progress are pages of their own). */
const LINKS: Array<[string, string]> = [
  ['#playground', 'Playground'],
  ['#layouts', 'Layouts'],
  ['#start', 'Quick start'],
  ['#api', 'API'],
  ['#/docs', 'Docs'],
  ['#/progress', 'Progress'],
];

export function SiteHeader({
  route,
  view,
  withSidebar,
  theme,
  onToggleTheme,
  menuOpen,
  onToggleMenu,
}: {
  route: Route;
  view: View;
  withSidebar: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  const current = (to: string) => (to === '#/docs' ? route === 'package' && view === 'docs' : to === '#/progress' ? route === 'progress' : false);
  return (
    <header className="dh">
      <div className="dh__inner">
        <button
          type="button"
          className="dh__icon dh__menu"
          hidden={!withSidebar}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="docs-sidebar"
          onClick={onToggleMenu}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href={M2TOOLKIT}>
                <span className="crumbs__mark" aria-hidden="true">
                  M2
                </span>
                <span className="crumbs__site">M2Toolkit</span>
              </a>
            </li>
            <li className="crumbs__mid">
              <a href={PACKAGES_URL}>NPM Packages</a>
            </li>
            <li>
              <a href="#/" aria-current={route === 'package' ? 'page' : undefined}>
                Timelines
              </a>
              <span className="crumbs__ver">v{PKG.version}</span>
            </li>
            {route === 'progress' && (
              <li>
                <a href="#/progress" aria-current="page">
                  Progress
                </a>
              </li>
            )}
          </ol>
        </nav>
        {withSidebar ? <DocSearch /> : <span className="dh__spacer" />}
        <nav className="dh__links" aria-label="Sections">
          {LINKS.map(([to, label]) => (
            <a key={to} href={to} aria-current={current(to) ? 'page' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <span className="dh__install">
          <code>
            <span aria-hidden="true">$ </span>npm i {PKG.name}
          </code>
          <CopyButton text={`npm i ${PKG.name}`} label="" className="dh__install-copy" />
        </span>
        <button
          type="button"
          className="dh__icon"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </div>
      <nav className="dh__views" aria-label="Package sections">
        {LINKS.map(([to, label]) => (
          <a key={to} href={to} aria-current={current(to) ? 'page' : undefined}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

/* ---- sidebar --------------------------------------------------------------------------------- */

export function Sidebar({ active, open, onNavigate }: { active: string | null; open: boolean; onNavigate: () => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  return (
    <nav id="docs-sidebar" className="dside" data-open={open ? '' : undefined} aria-label="Documentation">
      {NAV.map((group) => {
        const isOpen = !collapsed[group.label];
        const hasActive = group.items.some((i) => i.id === active);
        return (
          <div className="dside__group" key={group.label} data-active={hasActive ? '' : undefined}>
            <button
              type="button"
              className="dside__head"
              aria-expanded={isOpen}
              onClick={() => setCollapsed((c) => ({ ...c, [group.label]: isOpen }))}
            >
              {group.label}
              <Icon name="chevron" size={16} />
            </button>
            {isOpen && (
              <ul className="dside__list">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href ?? `#${item.id}`}
                      className="dside__link"
                      aria-current={item.id === active ? 'location' : undefined}
                      onClick={onNavigate}
                    >
                      {item.label}
                      {item.href && <Icon name="arrow" size={14} />}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/* ---- footer ---------------------------------------------------------------------------------- */

export function SiteFooter() {
  return (
    <footer className="dfoot">
      <div className="dfoot__grid">
        <div className="dfoot__brand">
          <p className="dfoot__name">Timelines</p>
          <p className="dfoot__text">
            <code>{PKG.name}</code> v{PKG.version} · {PKG.license} licensed · part of the M2Toolkit npm packages.
          </p>
        </div>
        <nav aria-label="Documentation links">
          <p className="dfoot__head">Documentation</p>
          <ul>
            <li>
              <a href="#docs-install">Installation</a>
            </li>
            <li>
              <a href="#docs-quickstart">Quick start</a>
            </li>
            <li>
              <a href="#api-props">API reference</a>
            </li>
            <li>
              <a href="#docs-troubleshooting">Troubleshooting</a>
            </li>
          </ul>
        </nav>
        <nav aria-label="Package links">
          <p className="dfoot__head">Package</p>
          <ul>
            <li>
              <a href="#gallery">Layout gallery</a>
            </li>
            <li>
              <a href="#playground">Playground</a>
            </li>
            <li>
              <a href="#/progress">Progress components</a>
            </li>
            <li>
              <a href="#docs-changelog">Changelog</a>
            </li>
          </ul>
        </nav>
        <nav aria-label="M2Toolkit links">
          <p className="dfoot__head">M2Toolkit</p>
          <ul>
            <li>
              <a href={PACKAGES_URL}>All npm packages</a>
            </li>
            {RELATED.map((p) => (
              <li key={p.slug}>
                <a href={p.url}>{p.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
