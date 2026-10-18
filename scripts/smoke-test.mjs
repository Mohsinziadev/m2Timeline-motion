// End-to-end check of the *published* artefact: packs the package, installs the tarball into a fresh
// project, type-checks every file in examples/ against it, then server-renders them through both the
// ESM and CommonJS entry points.
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const work = resolve(root, '.smoke');
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'], encoding: 'utf8' });

await rm(work, { recursive: true, force: true });
await mkdir(work, { recursive: true });

const packed = JSON.parse(run('npm', ['pack', '--json', '--pack-destination', work], root))[0];
console.log(`• packed ${packed.filename} (${(packed.size / 1024).toFixed(1)} kB, ${packed.files.length} files)`);
const leaked = packed.files.map((f) => f.path).filter((p) => !/^(dist\/|README\.md|CHANGELOG\.md|LICENSE|package\.json)/.test(p));
if (leaked.length) throw new Error(`Unexpected files in tarball: ${leaked.join(', ')}`);

const app = resolve(work, 'app');
await mkdir(resolve(app, 'src'), { recursive: true });
await writeFile(resolve(app, 'package.json'), JSON.stringify({ name: 'smoke-app', private: true, type: 'module' }, null, 2));
run(
  'npm',
  [
    'install',
    '--no-audit',
    '--no-fund',
    '--loglevel=error',
    resolve(work, packed.filename),
    'react@19',
    'react-dom@19',
    '@types/react@19',
    '@types/react-dom@19',
    'typescript@5',
  ],
  app,
);
console.log('• installed tarball into a fresh project');

await cp(resolve(root, 'examples'), resolve(app, 'src'), { recursive: true });
await writeFile(
  resolve(app, 'tsconfig.json'),
  JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: true,
      skipLibCheck: false,
      outDir: 'out',
      rootDir: 'src',
      lib: ['ES2022', 'DOM'],
      types: [],
    },
    include: ['src'],
  }),
);
run('npx', ['tsc', '-p', 'tsconfig.json'], app);
console.log('• examples type-check against the published types (skipLibCheck: false)');

// Node cannot import CSS, so strip the stylesheet imports from the compiled examples.
const outFiles = (await readdir(resolve(app, 'out'), { recursive: true })).filter((f) => f.endsWith('.js'));
for (const f of outFiles) {
  const p = resolve(app, 'out', f);
  await writeFile(p, (await readFile(p, 'utf8')).replace(/^import ['"]m2timeline-motion\/styles\.css['"];?$/m, ''));
}

const ssr = `
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const checks = [
  ['./out/quickstart.js', 'QuickStart'], ['./out/roadmap.js', 'Roadmap'], ['./out/project.js', 'ProjectPlan'],
  ['./out/career.js', 'Experience'], ['./out/releases.js', 'Changelog'], ['./out/history.js', 'History'],
  ['./out/feed.js', 'Activity'], ['./out/custom-layout.js', 'SprintBoard'],
  ['./out/nextjs-app-router/app/release-timeline.js', 'ReleaseTimeline', { events: [{ id: 1, title: 'x', date: '2026-01-01' }] }],
  ['./out/headless.js', 'Headless', { events: [{ id: 1, title: 'x' }] }],
  ['./out/progress.js', 'ProgressExamples'],
];
for (const [file, name, props] of checks) {
  const mod = await import(file);
  const html = renderToString(createElement(mod[name], props));
  if (!html.includes('m2t')) throw new Error(file + ' rendered no timeline');
}
console.log('• ESM: ' + checks.length + ' examples server-render');
const cjs = require('m2timeline-motion');
const html = renderToString(createElement(cjs.Timeline, { variant: 'gantt', events: [{ id: 1, title: 'CJS works', date: '2026-01-01', endDate: '2026-02-01' }] }));
if (!html.includes('CJS works')) throw new Error('CJS render failed');
console.log('• CJS: require("m2timeline-motion") renders');
const css = require.resolve('m2timeline-motion/styles.css');
if (!css.endsWith('styles.css')) throw new Error('styles.css export missing');
console.log('• styles.css export resolves');
`;
await writeFile(resolve(app, 'ssr.mjs'), ssr);
process.stdout.write(run('node', ['ssr.mjs'], app));

await rm(work, { recursive: true, force: true });
console.log('✓ smoke test passed');
