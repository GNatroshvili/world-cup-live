# World Cup 2026 Live

A premium, dark-themed FIFA World Cup 2026 dashboard built with **Next.js 16 (App Router)**, **TypeScript**, **SCSS Modules**, **Framer Motion** and **Zustand**. Data is sourced live from [TheSportsDB](https://www.thesportsdb.com); standings and statistics are computed locally from match results.

## Features

- **Three-column home board** — Groups A–F · full knockout bracket · Groups G–L.
- **Knockout bracket** (Round of 32 → Final + Third Place) with CSS connector lines and clickable ties.
- **Animated modals** — group details (full standings, results, fixtures) and match details, with fade/scale/blur transitions.
- **Match Centre** (`/matches`) — live / upcoming / completed filtering, group + date sorting.
- **Teams** (`/teams`) — searchable, group-filterable grid of all 48 nations.
- **Team profiles** (`/team/[id]`) — banner, crest, description, info, recent & upcoming matches.
- **Statistics** (`/statistics`) — leaderboards (goals, wins, goal difference, clean sheets, appearances) and highest-scoring matches, all computed from results.
- Fully responsive (320 → 1920px), SEO metadata, loading skeletons, error & not-found states.

## Architecture

```
app/            App Router routes, layouts, error/loading/not-found, global SCSS
components/      UI primitives (Button, Modal, TeamBadge, …) + layout (Header, Footer)
features/        Domain features (groups, bracket, matches, teams, statistics, home)
services/        TheSportsDB client (timeout + retry + revalidate) and endpoints
lib/             Tournament orchestration (worldcup.ts) and derivations (derive.ts)
data/            Static tournament structure (group draw, host venues, knockout template)
store/           Zustand UI store (search, modals, mobile nav)
types/           Raw API types + normalized domain models
utils/           Formatting + helpers
styles/          SCSS design system (abstracts: tokens/mixins/functions; base)
```

### Data strategy

The free TheSportsDB tier does not expose the 12-group draw or the full 104-match
calendar, so the **structure** (group draw, the 16 real host venues, the knockout
template) is seeded in `data/tournament.ts` and **enriched with live API data**
(team crests, descriptions, banners, real scores) wherever available. **No results
are hardcoded** — standings and statistics are computed in `lib/derive.ts` from the
finished matches returned by the API. If the API is unreachable, the full structure
still renders and the UI flags offline mode.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build && npm run start
```

### Environment

```bash
# Optional — defaults to the free public test key "3".
THESPORTSDB_KEY=your_key
```

## Tech

Next.js 16 · React 19 · TypeScript · SCSS Modules (Dart Sass) · Framer Motion · Zustand · `next/image`.

> Unofficial fan project. Not affiliated with FIFA. Data © TheSportsDB.
