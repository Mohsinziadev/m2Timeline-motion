import { useState, type ReactNode } from 'react';
import { Icon } from '../icons';
import { installCommand, PACKAGE_MANAGERS, type PackageManager } from '../meta';
import { CopyButton } from './ui';

/** Tip / warning callout. */
export function Callout({ tone = 'tip', title, children }: { tone?: 'tip' | 'warning' | 'info'; title: string; children: ReactNode }) {
  return (
    <aside className="callout" data-tone={tone}>
      <span className="callout__icon" aria-hidden="true">
        <Icon name={tone === 'warning' ? 'alert' : tone === 'info' ? 'info' : 'bulb'} />
      </span>
      <div className="callout__body">
        <p className="callout__title">{title}</p>
        <div className="callout__text">{children}</div>
      </div>
    </aside>
  );
}

/** Install command with npm / pnpm / yarn / bun tabs and a copy button. */
export function InstallPanel({ compact }: { compact?: boolean }) {
  const [pm, setPm] = useState<PackageManager>('npm');
  const command = installCommand(pm);
  return (
    <div className={`install-panel ${compact ? 'install-panel--compact' : ''}`}>
      <div className="install-panel__tabs" role="tablist" aria-label="Package manager">
        {PACKAGE_MANAGERS.map((m) => (
          <button key={m} type="button" role="tab" aria-selected={pm === m} className="install-panel__tab" onClick={() => setPm(m)}>
            {m}
          </button>
        ))}
      </div>
      <div className="install-panel__row" role="tabpanel">
        <span className="install-panel__prompt" aria-hidden="true">
          $
        </span>
        <code className="install-panel__cmd">{command}</code>
        <CopyButton text={command} />
      </div>
    </div>
  );
}

/** Renders the small Markdown subset used by CHANGELOG.md: headings, paragraphs, lists, links, code. */
export function MiniMarkdown({ source, skipTitle = true }: { source: string; skipTitle?: boolean }) {
  const blocks: ReactNode[] = [];
  const lines = source.replace(/\r/g, '').split('\n');
  let i = 0;
  let key = 0;
  const inline = (text: string): ReactNode[] =>
    text.split(/(`[^`]+`|\[[^\]]+\]\([^)]+\))/).map((part, n) => {
      if (part.startsWith('`')) return <code key={n}>{part.slice(1, -1)}</code>;
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (link)
        return (
          <a key={n} href={link[2]} target="_blank" rel="noopener noreferrer">
            {link[1]}
          </a>
        );
      return part;
    });
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      if (!(skipTitle && level === 1)) {
        const Tag = `h${Math.min(6, level + 2)}` as 'h4';
        blocks.push(
          <Tag key={key++} className={`md-h md-h${level}`}>
            {inline(heading[2])}
          </Tag>,
        );
      }
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        if (/^\s*[-*]\s+/.test(lines[i])) items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        else items[items.length - 1] += ` ${lines[i].trim()}`;
        i++;
      }
      blocks.push(
        <ul key={key++} className="md-list">
          {items.map((item, n) => (
            <li key={n}>{inline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4})\s/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i]))
      para.push(lines[i++].trim());
    blocks.push(
      <p key={key++} className="md-p">
        {inline(para.join(' '))}
      </p>,
    );
  }
  return <div className="md">{blocks}</div>;
}
