import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The demo consumes the library from source for instant HMR. `npm run smoke` separately verifies the
// published tarball (ESM, CJS, types, SSR) with the same example files shown in the docs.
export default defineConfig({
  root: r('.'),
  base: './',
  plugins: [react()],
  // Day granularity keeps the client and server builds of `npm run build:site` identical.
  define: { __DEMO_DAY__: JSON.stringify(new Date().toISOString().slice(0, 10)) },
  resolve: {
    alias: [
      { find: 'm2timeline-motion/styles.css', replacement: r('../src/styles/index.css') },
      { find: /^m2timeline-motion$/, replacement: r('../src/index.ts') },
    ],
  },
  server: { fs: { allow: [r('..')] } },
  build: { outDir: r('dist'), emptyOutDir: true },
});
