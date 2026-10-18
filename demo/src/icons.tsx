import type { ReactNode } from 'react';

export type Pastel = 'green' | 'purple' | 'orange' | 'blue' | 'pink' | 'yellow';

const paths = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  vertical: (
    <>
      <circle cx="7" cy="5" r="2" />
      <circle cx="7" cy="12" r="2" />
      <circle cx="7" cy="19" r="2" />
      <path d="M7 7v3M7 14v3M11 5h8M11 12h6M11 19h7" />
    </>
  ),
  alternating: (
    <>
      <path d="M12 3v18" />
      <circle cx="12" cy="7" r="1.6" />
      <circle cx="12" cy="17" r="1.6" />
      <path d="M15 7h5M4 17h5" />
    </>
  ),
  horizontal: (
    <>
      <path d="M3 12h18" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
      <path d="M5 17h3M11 17h3M17 17h2" />
    </>
  ),
  roadmap: (
    <>
      <rect x="3" y="4" width="5" height="16" rx="1.5" />
      <rect x="10" y="4" width="5" height="11" rx="1.5" />
      <rect x="17" y="4" width="4" height="7" rx="1.5" />
    </>
  ),
  gantt: (
    <>
      <path d="M4 5h7M7 10h9M10 15h7M6 20h5" strokeWidth="2.6" />
    </>
  ),
  career: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7M3 13h18" />
    </>
  ),
  history: (
    <>
      <path d="M4 12a8 8 0 108-8 8 8 0 00-6.4 3.2" />
      <path d="M4 4v4h4M12 8v4l3 2" />
    </>
  ),
  changelog: (
    <>
      <path d="M8 4h11v16H8zM8 4H5v16h3" />
      <path d="M11 9h5M11 13h5M11 17h3" />
    </>
  ),
  story: (
    <>
      <path d="M4 5.5A1.5 1.5 0 015.5 4H11v16H5.5A1.5 1.5 0 014 18.5zM20 5.5A1.5 1.5 0 0018.5 4H13v16h5.5a1.5 1.5 0 001.5-1.5z" />
    </>
  ),
  minimal: (
    <>
      <path d="M4 6h3M4 12h3M4 18h3M10 6h10M10 12h8M10 18h9" />
    </>
  ),
  cards: (
    <>
      <rect x="3" y="4" width="8" height="7" rx="2" />
      <rect x="13" y="4" width="8" height="7" rx="2" />
      <rect x="3" y="13" width="8" height="7" rx="2" />
      <rect x="13" y="13" width="8" height="7" rx="2" />
    </>
  ),
  zigzag: <path d="M5 6h12a3 3 0 010 6H7a3 3 0 000 6h12" />,
  stepper: (
    <>
      <circle cx="5" cy="12" r="2.2" />
      <circle cx="12" cy="12" r="2.2" />
      <circle cx="19" cy="12" r="2.2" />
      <path d="M7.2 12h2.6M14.2 12h2.6" />
    </>
  ),
  feed: (
    <>
      <path d="M6 4a2 2 0 100 4 2 2 0 000-4zM6 16a2 2 0 100 4 2 2 0 000-4zM11 6h9M11 18h9M11 9h6M11 21h4" />
    </>
  ),
  bar: (
    <>
      <rect x="3" y="9" width="18" height="6" rx="3" />
      <path d="M6 12h7" strokeWidth="3" />
    </>
  ),
  segments: <path d="M3 12h3.5M9 12h3M14.5 12h3M20 12h1" strokeWidth="3.2" />,
  steps: (
    <>
      <circle cx="5" cy="12" r="2.5" />
      <circle cx="19" cy="12" r="2.5" />
      <path d="M7.5 12h9" />
      <path d="M4 12l.8.8L6.2 11" />
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="12" r="8" opacity=".35" />
      <path d="M12 4a8 8 0 017.6 10.5" />
    </>
  ),
  package: (
    <>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
      <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
    </>
  ),
  code: <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 000 18c1.4 0 2-1 1.4-2.2-.6-1.3.3-2.8 1.8-2.8H17a4 4 0 004-4c0-5-4-9-9-9z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10" cy="7" r="1" />
      <circle cx="15" cy="7.5" r="1" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" />
    </>
  ),
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" />,
  motion: <path d="M3 12c3-6 6-6 9 0s6 6 9 0" />,
  a11y: (
    <>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M5 8l7 1.5L19 8M12 9.5V14l-3 6M12 14l3 6" />
    </>
  ),
  bolt: <path d="M13 3L5 13h6l-1 8 8-10h-6z" />,
  server: (
    <>
      <rect x="4" y="4" width="16" height="7" rx="2" />
      <rect x="4" y="13" width="16" height="7" rx="2" />
      <path d="M8 7.5h.01M8 16.5h.01" />
    </>
  ),
  ts: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7 11h6M10 11v7M18 11.5c-.5-.6-1.2-.9-2-.9-1.1 0-2 .6-2 1.6 0 2.1 4 1.2 4 3.4 0 1-.9 1.7-2.1 1.7-.9 0-1.7-.4-2.1-1" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />,
  book: <path d="M4 5.5A1.5 1.5 0 015.5 4H10a2 2 0 012 2v14a2 2 0 00-2-2H4zM20 5.5A1.5 1.5 0 0018.5 4H14a2 2 0 00-2 2v14a2 2 0 012-2h6z" />,
  play: <path d="M7 5l12 7-12 7z" />,
  terminal: <path d="M5 7l4 4-4 4M11 16h8" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  alert: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  layers: <path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5" />,
  sliders: <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

/** Soft pastel circle with a line icon, like the onboarding checklist. */
export function Tile({ name, tone, size = 'md' }: { name: IconName; tone: Pastel; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className="tile" data-tone={tone} data-size={size}>
      <Icon name={name} size={size === 'lg' ? 24 : size === 'sm' ? 16 : 20} />
    </span>
  );
}
