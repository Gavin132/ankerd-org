# ankerd

Personal site built with [Astro](https://astro.build): blog posts, recent YouTube uploads, and a photo gallery — with light/dark themes around a cyan→teal brand gradient.

## Setup

```sh
pnpm install
pnpm dev
```

## Configuration

- **Site title / description / social links**: `src/consts.ts`
- **Production domain**: `site` in `astro.config.mjs`
- **Logo**: `src/components/Logo.astro` is a placeholder gradient wordmark — swap in the real logo SVG there.

### YouTube videos (`/videos`)

Recent uploads are fetched at build time from the YouTube Data API v3:

1. Copy `.env.example` to `.env` and set `YOUTUBE_API_KEY` (create a key in the [Google Cloud console](https://console.cloud.google.com/apis/credentials) with "YouTube Data API v3" enabled).
2. Set `YOUTUBE_CHANNEL_ID` in `src/consts.ts` (starts with `UC…`).

Without these, the build still succeeds and the page shows a "coming soon" state. Videos refresh on each rebuild.

### Gallery (`/gallery`)

One markdown file per photo in `src/content/gallery/`, image files in `src/assets/gallery/`:

```markdown
---
title: 'Harbor at dusk'
description: 'Optional longer description shown in the lightbox.'
date: '2026-07-01'
photo: '../../assets/gallery/harbor-at-dusk.jpg'
alt: 'A harbor at dusk'
camera: 'Fujifilm X-T5'      # optional
lens: 'XF 35mm f/1.4'        # optional
settings: 'f/2.8 · 1/250s · ISO 400'  # optional
---
```

Delete the `sample-photo-*.md` entries once real photos are added.

### Blog (`/blog`)

Markdown/MDX files in `src/content/blog/` (frontmatter: `title`, `description`, `pubDate`, optional `updatedDate` / `heroImage`). An RSS feed is generated at `/rss.xml`.

## Theming

Design tokens live in `src/styles/global.css` — light theme in `:root`, dark overrides under `[data-theme='dark']`. The theme follows the visitor's OS preference by default; the sidebar toggle overrides it and persists in `localStorage`.

## Commands

| Command        | Action                                       |
| :------------- | :------------------------------------------- |
| `pnpm install` | Install dependencies                         |
| `pnpm dev`     | Start local dev server at `localhost:4321`   |
| `pnpm build`   | Build the production site to `./dist/`       |
| `pnpm preview` | Preview the build locally before deploying   |

## Credit

Based on the Astro blog starter, which is based on [Bear Blog](https://github.com/HermanMartinus/bearblog/).
