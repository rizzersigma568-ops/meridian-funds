# Meridian

Research desk for **Indian mutual funds** and **US ETFs** in one currency-aware book.

Meridian is for discovery, comparison, and manual portfolio tracking — not brokerage or trading. Catalog figures are illustrative research data, not live market quotes.

## What you can do

- Browse an India + United States fund catalog
- Open a research page (costs, holdings, history, documents)
- Compare up to four funds side by side
- Track a global portfolio with INR/USD switching
- Keep watchlists and simple alerts
- Run SIP / DCA calculators
- Read catalog-based explanations (the math stays outside the model)

## Run locally

You need [Node.js 22+](https://nodejs.org/).

```bash
git clone https://github.com/rizzersigma568-ops/meridian-funds.git
cd meridian-funds
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

### Other commands

```bash
npm run build      # production build into dist/
npm run preview    # serve the production build
npm run typecheck  # TypeScript check
```

Portfolio lots, watchlists, and alerts are stored in the browser (`localStorage`). Clearing site data resets the sample book.

## Deploy

This repo is set up for **GitHub Pages** via `.github/workflows/pages.yml`.

Live site: [https://rizzersigma568-ops.github.io/meridian-funds/](https://rizzersigma568-ops.github.io/meridian-funds/)

You can also deploy the same Vite app to [Vercel](https://vercel.com/) (SPA rewrite is in `vercel.json`) or any static host. Use `npm run build` and publish the `dist/` folder. For a project-page path prefix, set `GITHUB_PAGES=true` at build time (this repo’s Pages workflow already does).

## Stack

React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS v4, Recharts, Zustand.

## Disclaimer

Meridian does not execute trades or provide personalized investment advice. Historical performance is not a forecast.
