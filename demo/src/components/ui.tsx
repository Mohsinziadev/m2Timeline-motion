import { useId, type ReactNode } from 'react';
import { highlight, useCopy } from '../lib';

export function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const { copied, copy } = useCopy();
  return (
    <button type="button" className={`copy-btn ${className ?? ''}`} onClick={() => copy(text)} aria-live="polite">
      {copied ? (
        <>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <rect x="8" y="8" width="12" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

export function CodeBlock({ code, title, lang = 'tsx', maxHeight }: { code: string; title?: string; lang?: string; maxHeight?: number }) {
  return (
    <div className="code">
      <div className="code__bar">
        <span className="code__title">{title ?? lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="code__pre" style={maxHeight ? { maxHeight } : undefined} tabIndex={0}>
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}

export function InstallCommand({ command = 'npm install m2timeline-motion' }: { command?: string }) {
  return (
    <div className="install">
      <span className="install__prompt" aria-hidden="true">
        $
      </span>
      <code>{command}</code>
      <CopyButton text={command} label="Copy" className="copy-btn--ghost" />
    </div>
  );
}

/* ---- form controls --------------------------------------------------------------------------- */

export function Field({ label, children, hint }: { label: string; children: (id: string) => ReactNode; hint?: string }) {
  const id = useId();
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children(id)}
      {hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}

export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
  format,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <Field label={label}>
      {(id) => (
        <select
          id={id}
          className="select"
          value={String(value)}
          onChange={(e) => {
            const raw = e.target.value;
            const match = options.find((o) => String(o) === raw);
            if (match !== undefined) onChange(match);
          }}
        >
          {options.map((o) => (
            <option key={String(o)} value={String(o)}>
              {format ? format(o) : String(o)}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <div className="field">
      <span className="field__label" id={id}>
        {label}
      </span>
      <div className="segmented" role="radiogroup" aria-labelledby={id}>
        {options.map((o) => (
          <button key={o} type="button" role="radio" aria-checked={value === o} className="segmented__btn" onClick={() => onChange(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="toggle">
      <label htmlFor={id} className="toggle__label">
        {label}
        {hint && <span className="toggle__hint">{hint}</span>}
      </label>
      <button id={id} type="button" role="switch" aria-checked={checked} className="switch" onClick={() => onChange(!checked)}>
        <span className="switch__thumb" />
      </button>
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={`${label} · ${value}${unit}`}>
      {(id) => (
        <input
          id={id}
          className="range"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
    </Field>
  );
}
