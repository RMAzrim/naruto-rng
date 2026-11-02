# Shinobi Genesis

Browser-based Naruto-inspired RNG character generator and 1v1 battle simulator.

## Stack
- React, Vite, TypeScript (strict)
- CSS/SVG for UI and wheel effects
- Vitest for unit tests
- GitHub Pages for static hosting

## Getting started

```bash
npm install
npm run dev       # local development
npm run build     # production build
npm test          # run unit tests
npm run preview   # preview production build
```

## Deployment to GitHub Pages

1. Create a GitHub repository and push this folder to the `main` branch.
2. In the repository Settings → Pages, set the source to **GitHub Actions**.
3. Enable the **Deploy to GitHub Pages** workflow (Actions tab) and run it.
4. If your repository is NOT at the root domain (i.e. hosted at `https://<user>.github.io/<repo>/`), set the Vite `base` in `vite.config.ts` to `/<repo>/` before building:

```ts
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/<repo>/' : '/',
  // ...
});
```

## Project structure

- `src/engine/` — headless game logic (RNG, validation, generation, battle, persistence). No React/UI imports.
- `src/data/` — curated JSON game data (eras, titles, clans, etc.) and `index.ts` loader.
- `src/pages/` — routes: Home, Generator, Character, Arena, Collection, Settings.
- `src/components/` — Wheel, SpinCard, CharacterCard.
- `src/hooks/useGeneration.ts` — generation orchestrator.

## Notes

- No backend, no authentication, no paid API. Data persists in browser LocalStorage.
- RNG is seeded and deterministic for reproducibility.
- Titles dataset contains exactly 100 entries.
- Fan project — not affiliated with Naruto rights holders.
