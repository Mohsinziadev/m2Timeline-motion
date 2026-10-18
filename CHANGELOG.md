# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning policy

- **Major**: breaking changes to props, the `TimelineEvent` shape, exported types, documented CSS custom
  properties, class names or data attributes.
- **Minor**: new layouts, props, tokens or features that are backwards compatible.
- **Patch**: bug fixes, accessibility fixes and visual refinements that do not change the public API.

Pre-1.0 releases may contain breaking changes in minor versions; they are always called out below.

## [Unreleased]

## [0.1.0] - 2026-10-18

### Added

- 14 layouts: `VerticalTimeline` (left / right / alternating), `HorizontalTimeline`, `RoadmapTimeline`,
  `GanttTimeline`, `CareerTimeline`, `HistoryTimeline`, `ChangelogTimeline`, `StoryTimeline`,
  `MinimalTimeline`, `CardTimeline`, `ZigzagTimeline`, `StepperTimeline`, `FeedTimeline` and
  `CustomTimeline`, plus the unified `<Timeline variant>` component.
- Headless `useTimeline` hook and building blocks (`TimelineFrame`, `TimelineCard`, `TimelineMarker`,
  `TimelineToolbar`, parts and utilities).
- Themes (light / dark / auto), appearances (modern, minimal, glass, editorial, vibrant), density, radius,
  marker shapes, connector styles, animated connectors and glow.
- Scroll-reveal presets (fade, rise, slide, scale, blur, reveal), stagger, scroll-linked progress line,
  scroll-spy and auto-scroll; full `prefers-reduced-motion` support.
- Search, category filters, jump-to navigation, pagination, expandable details, controlled / uncontrolled
  active and expansion state, keyboard navigation and i18n labels.
- Progress components: `ProgressBar` (solid, segmented, dots, bars, slanted, chevron and outlined tracks;
  loading / success / error statuses; info tooltips; helper text; value placements incl. tooltip and inside;
  stripes, thumb, glow, buffer, indeterminate, milestones, cancel), `SegmentedProgress` (per-segment
  status with tooltips), `StepProgress` (numbered, dots and icon steps) and `CircularProgress` (rings and
  gauges).
- ESM + CommonJS builds with type declarations, per-module `'use client'` boundaries, CSS stylesheet.
