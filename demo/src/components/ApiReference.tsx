import type { ReactNode } from 'react';

/** [name, type, default, required, description] */
export type ApiRow = [string, string, string, boolean, string];

/** Renders `code` spans in descriptions. */
function md(text: string): ReactNode {
  return text.split(/(`[^`]+`)/).map((part, i) => (part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part));
}

export function ApiTable({ rows, label, first = 'Prop' }: { rows: ApiRow[]; label: string; first?: string }) {
  return (
    <div className="api-table" role="region" aria-label={label} tabIndex={0}>
      <table>
        <thead>
          <tr>
            <th scope="col">{first}</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, type, def, required, desc]) => (
            <tr key={name}>
              <td>
                <code className="api-name">{name}</code>
                {required && <span className="api-req">required</span>}
              </td>
              <td>
                <code className="api-type">{type}</code>
              </td>
              <td>{def === '—' ? <span className="api-none">—</span> : <code className="api-def">{def}</code>}</td>
              <td>{md(desc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
