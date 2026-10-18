# Publishing checklist

## One-time setup

- [ ] Create the GitHub repository and add `repository`, `homepage` and `bugs` fields to `package.json`.
- [ ] `npm login` with an account that has 2FA enabled (or configure an automation token in CI).
- [ ] Optional: enable [npm provenance](https://docs.npmjs.com/generating-provenance-statements) by publishing from GitHub Actions with `npm publish --provenance`.
- [ ] Optional: deploy the demo (`npm run build:demo` → `demo/dist`) to GitHub Pages, Netlify or Vercel and link it in the README.

## Every release

1. [ ] Working tree is clean and you are on the main branch.
2. [ ] Move the `[Unreleased]` notes in `CHANGELOG.md` under a new version heading with today's date.
3. [ ] Bump the version: `npm version patch|minor|major` (creates the commit and tag).
4. [ ] Run the full gate: `npm run verify`. It covers:
   - ESLint and TypeScript (library, tests, demo, examples)
   - the Vitest suite (unit, interaction, axe-core accessibility, SSR without a DOM, hydration)
   - the production build, which verifies every `'use client'` boundary
   - `publint --strict` and `@arethetypeswrong/cli` (ESM, CJS and bundler resolution)
   - bundle-size budgets
   - the smoke test: packs the tarball, installs it in a fresh project, type-checks all `examples/` with `skipLibCheck: false`, and server-renders them via ESM and CJS
5. [ ] Inspect the tarball contents: `npm pack --dry-run` should list only `dist/`, `README.md`, `CHANGELOG.md`, `LICENSE` and `package.json`.
6. [ ] Check the demo by eye in light and dark themes, at mobile width, and with reduced motion enabled.
7. [ ] Publish: `npm publish` (the `prepublishOnly` hook runs `npm run verify` again).
8. [ ] Push the commit and tag: `git push --follow-tags`, then create a GitHub release from the changelog entry.
