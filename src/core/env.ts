export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/** `true` outside production builds. Bundlers statically replace `process.env.NODE_ENV`. */
export const isDev = typeof process !== 'undefined' && process.env.NODE_ENV !== 'production';

const warned = new Set<string>();

/** Logs a development-only warning once per unique message. */
export function warnOnce(message: string): void {
  if (!isDev || warned.has(message)) return;
  warned.add(message);
  console.warn(`[m2timeline-motion] ${message}`);
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  let out = '';
  for (const part of parts) {
    if (part) out = out ? `${out} ${part}` : part;
  }
  return out;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
