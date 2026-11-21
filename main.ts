// Difference Detective — the entry program (Node 22, standard library only).
// The game is this directory's game/ folder: plain static files a desktop
// browser loads offline (game/index.html and its ES modules, no library and
// no network request). This program hands the entry in: it copies game/ and
// screenshots/ from beside this file into the output directory and writes
// /output/dossier.json, the summary the judge reads, using the vendored
// make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse — more than 4
// screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of
// game files in all, or a path under game/ over 1000 bytes.
const DOSSIER_OPTIONS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function fail(message) {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

function copyTree(from, to) {
  if (!existsSync(from)) fail(`missing ${from}`);
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    total += entry.isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

mkdirSync(out, { recursive: true });
copyTree(join(here, 'game'), join(out, 'game'));
copyTree(join(here, 'screenshots'), join(out, 'screenshots'));

const shotCount = readdirSync(join(here, 'screenshots')).filter((name) => /\.(png|jpe?g|webp)$/i.test(name)).length;
if (shotCount === 0) fail('no screenshots in screenshots/');
if (shotCount > DOSSIER_OPTIONS.screenshots.max) fail(`too many screenshots: ${shotCount}`);
const gameFiles = countFiles(join(here, 'game'));
console.log(`main.ts: ${gameFiles} game files, ${shotCount} screenshots -> ${out}`);

writeFileSync(join(out, 'dossier.json'), buildDossier(out, DOSSIER_OPTIONS));
console.log('main.ts: dossier.json written');
