import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Timeline } from '../src';
import { events, variants } from './fixtures';

const ongoing = [
  ...events,
  { id: 'role', title: 'Staff engineer', date: '2023-04', endDate: 'present' as const, group: 'Acme' },
  { id: 'recent', title: 'Deploy', date: '2025-06-16T12:00:00Z' },
];

describe('hydration', () => {
  it.each(variants)('%s hydrates without mismatches', async (variant) => {
    const element = <Timeline variant={variant} events={ongoing} search filters />;
    const html = renderToString(element);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const errors: unknown[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args));
    const recoverable: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, element, { onRecoverableError: (e) => recoverable.push(e) });
    });
    expect(recoverable).toEqual([]);
    expect(errors).toEqual([]);
    spy.mockRestore();
    act(() => root?.unmount());
    container.remove();
  });
});
