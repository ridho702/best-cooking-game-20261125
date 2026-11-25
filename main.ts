// Warung Rush — main.ts
// The hand-in program (Node 22, standard library only). It stages the game
// for the grader: copy game/ and screenshots/ from this repository into the
// output directory, then write dossier.json there with the vendored make.fun
// library. It runs twice in the grader and both runs must write the same
// bytes, so there is no timestamp, no randomness and no network here —
// just a deterministic copy plus the dossier the library builds.
//
// Local check:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The repository root is the directory holding this file.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// The grader sets MAKEFUN_OUTPUT_DIR; outside it, /output is the target.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file can never leak in.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

// The playable game: plain static files under game/.
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });

// The screenshots, when they exist. The gate allows at most four, each at
// most 256 KiB; the dossier builder enforces those caps.
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier the judge reads: the same caps the scorer uses, so a local
// run refuses exactly what the gate would refuse.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
