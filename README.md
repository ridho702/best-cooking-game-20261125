# Warung Rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/ridho702/best-cooking-game-20261125/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/ridho702/best-cooking-game-20261125/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Warung Rush** is a fast Indonesian street-food cooking game. Customers arrive at the order board with a patience timer; click an order, then click the ingredients on the counter in the exact recipe order — nasi goreng, mie goreng, sate ayam, es teh manis — and serve the finished plate before the customer walks away. Faster serves earn bigger tips, and each day brings more customers with less patience. Three days, three hearts, one warung.

## Play it

```sh
python3 -m http.server --directory game 8080
```

Then open http://localhost:8080 in desktop Chrome. Click orders and ingredients with the mouse, or use keys 1–0 for ingredients and Space to serve.

## Files

- `game/` — the playable game as plain static files (no build step, no network)
- `game/src/` — the game's own source, one file per job: recipes, audio, drawing, orders, game logic, bootstrap
- `screenshots/` — real renders of the game running in a browser
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`

---

<sub>Entered on [make.fun](https://make.fun/?ref=pxdmc197&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
