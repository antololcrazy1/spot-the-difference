// Difference Detective — boot and the one loop: taps are read every frame,
// the timer advances in real seconds, and the renderer paints what is there.
// The game moves between title, level select, play, paused, level done,
// time up and game done. DOM overlays carry the menus; the canvas carries
// the two scene panels.
//
// ?shot=start|play|level|win (with &seed=N) stages that scene instead of
// running the loop, paints it twice and sets window.__shotReady.
import { BEST_KEY, DIFF_KEY, DIFFICULTY, STARS_KEY } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_FOUND, EVENT_LEVEL_DONE, EVENT_TIME_UP, EVENT_WRONG } from './world.js';
import { KEY_HINT, KEY_LENS, KEY_MARK, KEY_PAUSE, createInput } from './input.js';
import {
  SCREEN_GAME_DONE,
  SCREEN_LEVEL_DONE,
  SCREEN_LEVELS,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TIMEOUT,
  SCREEN_TITLE,
  createRenderer,
} from './render.js';
import { stageShot } from './shots.js';
import { SCENES } from './scenes.js';
import { isMuted, playClick, playFound, playHint, playLevelComplete, playWrong, setMuted } from './audio.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 1;
const random = createRandom(seed);

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const world = createWorld(random);
const renderer = createRenderer(canvas);
const input = createInput(canvas);

let screen = SCREEN_TITLE;
let lensOn = true;
let last = performance.now();
let lastShownSecond = -1;

const $ = (id) => document.getElementById(id);
const hudLevel = $('hud-level');
const hudFound = $('hud-found');
const hudScore = $('hud-score');
const hudTime = $('hud-time');
const timeFill = $('timebar-fill');
const hudHints = $('hud-hints');
const hintToast = $('hint-toast');

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be off (private windows): progress then lasts this visit only.
  }
}

function readBest() {
  return readJSON(BEST_KEY, 0);
}

function saveBest(value) {
  saveJSON(BEST_KEY, value);
}

function announce(message) {
  statusEl.textContent = message;
}

const OVERLAYS = {
  [SCREEN_TITLE]: 'ov-title',
  [SCREEN_LEVELS]: 'ov-levels',
  [SCREEN_PAUSED]: 'ov-pause',
  [SCREEN_LEVEL_DONE]: 'ov-leveldone',
  [SCREEN_TIMEOUT]: 'ov-timeout',
  [SCREEN_GAME_DONE]: 'ov-win',
};

function applyScreen() {
  for (const [name, id] of Object.entries(OVERLAYS)) {
    $(id).classList.toggle('hidden', name !== screen);
  }
  $('hud').classList.toggle('hidden', screen === SCREEN_TITLE);
}

function showScreen(next) {
  screen = next;
  applyScreen();
}

function updateHUD() {
  const s = world.state;
  const scene = world.scene();
  hudLevel.textContent = `${s.levelIndex + 1}. ${scene.name}`;
  hudFound.textContent = `${s.found.size}/6 found`;
  hudScore.textContent = `Score ${s.score}`;
  const seconds = Math.ceil(s.timeLeft);
  if (seconds !== lastShownSecond) {
    lastShownSecond = seconds;
    hudTime.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
  timeFill.style.width = `${Math.max(0, (s.timeLeft / s.levelTime) * 100)}%`;
  timeFill.classList.toggle('low', s.timeLeft <= 15);
  hudHints.textContent = `💡 ${s.hintsLeft}`;
}

function buildLevelCards() {
  const grid = $('levels-grid');
  grid.innerHTML = '';
  SCENES.forEach((scene, index) => {
    const locked = index >= world.state.unlocked;
    const stars = world.state.stars[index] || 0;
    const card = document.createElement('button');
    card.className = `level-card${locked ? ' locked' : ''}`;
    card.type = 'button';
    card.innerHTML = `<span class="level-num">${index + 1}</span>
      <span class="level-name">${scene.name}</span>
      <span class="level-tag">${scene.tagline}</span>
      <span class="level-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>
      ${locked ? '<span class="level-lock">🔒</span>' : ''}`;
    card.disabled = locked;
    card.addEventListener('click', () => {
      playClick();
      startLevel(index);
    });
    grid.appendChild(card);
  });
}

function startLevel(index) {
  world.startLevel(index);
  renderer.prepareLevel(world.scene());
  lastShownSecond = -1;
  showScreen(SCREEN_PLAY);
  updateHUD();
  announce(`Level ${index + 1}: ${world.scene().name}. Find 6 differences.`);
}

function fillLevelDone() {
  const s = world.state;
  const stars = s.stars[s.levelIndex] || 1;
  $('ld-stars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  $('ld-title').textContent = `${world.scene().name} complete!`;
  $('ld-score').textContent = `Level score: ${s.score}  •  Total: ${s.totalScore}`;
  $('btn-next').textContent = s.levelIndex + 1 < SCENES.length ? 'Next level →' : 'See results →';
}

function fillWin() {
  const s = world.state;
  const totalStars = Object.values(s.stars).reduce((a, b) => a + b, 0);
  $('win-score').textContent = `Total score: ${s.totalScore}  •  ${totalStars} / 18 stars`;
  $('win-stars').textContent = '★'.repeat(Math.round(totalStars / 2));
  const best = readBest();
  if (s.totalScore > best) {
    saveBest(s.totalScore);
    $('win-best').textContent = `New best! Previous best was ${best}.`;
  } else {
    $('win-best').textContent = `Best total: ${best}`;
  }
}

function onLevelDone() {
  playLevelComplete();
  fillLevelDone();
  window.setTimeout(() => {
    if (world.state.levelDone) showScreen(SCREEN_LEVEL_DONE);
  }, 650);
}

function onTimeUp() {
  announce(`Time up on ${world.scene().name}.`);
  showScreen(SCREEN_TIMEOUT);
}

function doHint() {
  const pick = world.useHint();
  if (!pick) return;
  playHint();
  hintToast.textContent = `Hint: ${pick.label}`;
  hintToast.classList.remove('hidden');
  window.setTimeout(() => hintToast.classList.add('hidden'), 2600);
  announce(`Hint: ${pick.label}`);
  updateHUD();
}

function toggleLens() {
  lensOn = !lensOn;
  $('btn-lens').classList.toggle('off', !lensOn);
  $('btn-lens').textContent = lensOn ? '🔍 Lens on' : '🔍 Lens off';
}

function handleTap(fx, fy) {
  const hit = renderer.panelAt(fx, fy);
  if (!hit.side) return;
  const result = world.mark(hit.fx, hit.fy, hit.side);
  if (result.events & EVENT_FOUND) {
    playFound();
    announce(`Found: ${result.diff.label}. ${world.state.found.size} of 6.`);
  }
  if (result.events & EVENT_WRONG) {
    playWrong();
    announce('Not a difference. Minus 25 points and 3 seconds.');
  }
  if (result.events & EVENT_LEVEL_DONE) onLevelDone();
  updateHUD();
}

function togglePause() {
  if (screen === SCREEN_PLAY) {
    showScreen(SCREEN_PAUSED);
    announce('Paused.');
  } else if (screen === SCREEN_PAUSED) {
    showScreen(SCREEN_PLAY);
    announce('Playing.');
  }
}

function wireUI() {
  document.querySelectorAll('.diff-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach((b) => b.classList.remove('selected'));
      button.classList.add('selected');
      world.setDifficulty(button.dataset.diff);
      saveJSON(DIFF_KEY, button.dataset.diff);
      playClick();
    });
  });
  $('btn-start').addEventListener('click', () => {
    playClick();
    buildLevelCards();
    showScreen(SCREEN_LEVELS);
  });
  $('btn-levels-back').addEventListener('click', () => {
    playClick();
    showScreen(SCREEN_TITLE);
  });
  $('btn-hint').addEventListener('click', doHint);
  $('btn-lens').addEventListener('click', toggleLens);
  $('btn-sound').addEventListener('click', () => {
    setMuted(!isMuted());
    $('btn-sound').textContent = isMuted() ? '🔇 Muted' : '🔊 Sound';
  });
  $('btn-pause').addEventListener('click', togglePause);
  $('btn-resume').addEventListener('click', togglePause);
  $('btn-pause-quit').addEventListener('click', () => {
    playClick();
    buildLevelCards();
    showScreen(SCREEN_LEVELS);
  });
  $('btn-next').addEventListener('click', () => {
    playClick();
    if (world.state.levelIndex + 1 < SCENES.length) startLevel(world.state.levelIndex + 1);
    else {
      fillWin();
      showScreen(SCREEN_GAME_DONE);
    }
  });
  $('btn-ld-replay').addEventListener('click', () => {
    playClick();
    startLevel(world.state.levelIndex);
  });
  $('btn-ld-levels').addEventListener('click', () => {
    playClick();
    buildLevelCards();
    showScreen(SCREEN_LEVELS);
  });
  $('btn-retry').addEventListener('click', () => {
    playClick();
    startLevel(world.state.levelIndex);
  });
  $('btn-to-levels').addEventListener('click', () => {
    playClick();
    buildLevelCards();
    showScreen(SCREEN_LEVELS);
  });
  $('btn-again').addEventListener('click', () => {
    playClick();
    world.state.totalScore = 0;
    world.state.stars = {};
    world.state.unlocked = 1;
    saveJSON(STARS_KEY, {});
    startLevel(0);
  });
  $('btn-win-levels').addEventListener('click', () => {
    playClick();
    buildLevelCards();
    showScreen(SCREEN_LEVELS);
  });
}

function restoreSaved() {
  const difficulty = readJSON(DIFF_KEY, 'classic');
  world.setDifficulty(DIFFICULTY[difficulty] ? difficulty : 'classic');
  document.querySelectorAll('.diff-btn').forEach((b) => {
    b.classList.toggle('selected', b.dataset.diff === world.state.difficulty);
  });
  world.state.stars = readJSON(STARS_KEY, {});
  world.state.unlocked = Math.min(SCENES.length, 1 + Object.keys(world.state.stars).length);
  const best = readBest();
  $('best-line').textContent = best > 0 ? `Best total so far: ${best}` : 'No scores yet — be the first detective!';
  if (isMuted()) $('btn-sound').textContent = '🔇 Muted';
}

function runShot(name) {
  // Staged shots render from a clean slate, so two loads give identical bytes.
  try {
    window.localStorage.removeItem(BEST_KEY);
    window.localStorage.removeItem(STARS_KEY);
    window.localStorage.removeItem(DIFF_KEY);
  } catch {
    // Storage can be off: the shot still renders.
  }
  const staged = stageShot(name, world);
  screen = staged.screen;
  if (staged.ui && staged.ui.lens) {
    lensOn = staged.ui.lensOn;
    input.lens.x = staged.ui.lens.x;
    input.lens.y = staged.ui.lens.y;
    input.lens.visible = true;
  }
  renderer.prepareLevel(world.scene());
  if (screen === SCREEN_LEVEL_DONE) fillLevelDone();
  if (screen === SCREEN_GAME_DONE) fillWin();
  applyScreen();
  updateHUD();
  let painted = 0;
  function paint() {
    renderer.draw(world, screen, { lens: input.lens, lensOn, crosshair: { active: false }, now: 100 });
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  wireUI();
  restoreSaved();
  world.startLevel(0);
  renderer.prepareLevel(world.scene());
  showScreen(SCREEN_TITLE);
  announce('Difference Detective. Choose a difficulty and press Start.');

  const inputApi = input;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    const keys = inputApi.takeKeys();
    if (keys & KEY_PAUSE) togglePause();
    if (screen === SCREEN_PLAY) {
      if (keys & KEY_HINT) doHint();
      if (keys & KEY_LENS) toggleLens();
      if (keys & KEY_MARK) {
        const at = inputApi.markAtCrosshair();
        handleTap(at.x, at.y);
      }
      const events = world.tick(dt);
      if (events & EVENT_TIME_UP) onTimeUp();
      while (inputApi.taps.length > 0) {
        const tap = inputApi.taps.shift();
        handleTap(tap.x, tap.y);
      }
      updateHUD();
    }
    renderer.draw(world, screen, { lens: inputApi.lens, lensOn, crosshair: inputApi.crosshair });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) showScreen(SCREEN_PAUSED);
  });

  requestAnimationFrame(frame);
}

window.__game = {
  screen: () => screen,
  state: world.state,
  scene: () => world.scene(),
  levels: SCENES.length,
  startLevel: (index) => startLevel(index),
  setDifficulty: (key) => world.setDifficulty(key),
  markAt: (fx, fy, side) => world.mark(fx, fy, side),
  hint: () => world.useHint(),
  toggleLens: () => toggleLens(),
  /** Page coordinates of a point on a panel, for real taps in playtests. */
  pointFor: (side, fx, fy) => {
    const rects = renderer.layout();
    const r = rects[side];
    const rect = canvas.getBoundingClientRect();
    return { x: rect.left + r.x + fx * r.w, y: rect.top + r.y + fy * r.h };
  },
};

if (shot) runShot(shot);
else runGame();
