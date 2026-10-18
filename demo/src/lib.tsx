import { useEffect, useState, type ReactNode } from 'react';

/* ---- syntax highlighting (tiny, dependency-free TSX / shell / CSS tokenizer) ----------------- */

const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(<\/?[A-Za-z][\w.]*|\/?>)|\b(import|from|export|function|return|const|let|type|interface|default|extends|true|false|null|undefined|new|if|else|as)\b|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_][\w-]*(?==)|--[\w-]+)|(\b[A-Z][\w]*\b)/g;

export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of code.matchAll(TOKEN)) {
    if (m.index! > last) out.push(code.slice(last, m.index));
    const cls = m[1] ? 'tk-c' : m[2] ? 'tk-s' : m[3] ? 'tk-t' : m[4] ? 'tk-k' : m[5] ? 'tk-n' : m[6] ? 'tk-a' : 'tk-y';
    out.push(
      <span key={i++} className={cls}>
        {m[0]}
      </span>,
    );
    last = m.index! + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), timeout);
  };
  return { copied, copy };
}

/**
 * The last section whose top has passed a reading line under the sticky header. Scroll is
 * throttled to animation frames and state only changes when the active section does.
 */
export function useScrollSpy(ids: readonly string[], offset = 140): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) current = id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) {
        const visible = ids.filter((id) => {
          const r = document.getElementById(id)?.getBoundingClientRect();
          return r && r.top < window.innerHeight;
        });
        current = visible.at(-1) ?? current;
      }
      setActive((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids, offset]);
  return active;
}
