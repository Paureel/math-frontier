# Frontier

Explore community projects working to improve the mathematical frontier from the **October 2026 [openai/math](https://github.com/openai/math) release**.

Browse an interactive map of problems and projects, filter by topic, and open plain-language explanations, metrics, and source evidence.

## Run locally

Requires Node.js 22.12+ and Git.

```sh
npm ci
npm run dev
```

Open [localhost:5178](http://127.0.0.1:5178/).

## Data and research claims

Known projects receive public GitHub updates every 12 hours, with a saved snapshot as fallback. Discovering new repositories requires a manual scan by the project owner; the catalogue is not exhaustive.

Author claims remain visibly unreviewed. Reviewed values require owner-inspected evidence pinned to exact source versions. README numbers, PRs, merges, and CI badges cannot approve a result. Proof refinements and method limitations stay separate from improved frontier bounds. The app does not independently certify mathematical proofs.

## Privacy

No accounts, cookies, analytics, or saved visitor preferences. Exploration stays in memory; only public research data is cached.

An optional `GITHUB_TOKEN` must stay server-side. Keep secrets in ignored environment files and never use a `VITE_` prefix for tokens.

## Maintenance

```sh
npm test           # Run checks
npm run build      # Build the app
npm run measure    # Measure the built downloads and estimate traffic credits
npm run sync       # Refresh known sources
npm run discover   # Owner-triggered discovery scan
```

Source audits: [release](docs/scientific-audit.json) · [latest community evidence](docs/latest-results-audit.json).

The app runs locally by default, with no automatic deployment.

The Netlify configuration serves a shared public snapshot and refreshes known sources twice daily without rebuilding the site. After a new deployment, run `refresh-frontier` using Netlify’s **Run now** button, or wait for its next scheduled run. Visitor requests never scan GitHub. Source excerpts and mathematical notation load on demand; hashed assets can be reused on repeat visits.

## License

Copyright 2026 Frontier contributors. Original project code and documentation are licensed under [Apache 2.0](LICENSE). Third-party dependencies and upstream research material retain their respective licenses.
