// Difference Detective — the play state: which level, what is found, the
// score, the combo, the timer and the hints. The scenes themselves live in
// scenes.js; this file only tracks a level being played.
import {
  DIFFS_PER_LEVEL,
  DIFFICULTY,
  HINTS_PER_LEVEL,
  POINTS_COMBO_CAP,
  POINTS_COMBO_STEP,
  POINTS_FOUND,
  POINTS_HINT,
  POINTS_WRONG,
  TIME_BONUS_PER_SECOND,
  TIME_PENALTY_WRONG,
} from './config.js';
import { SCENES } from './scenes.js';

export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_LEVEL_DONE = 4;
export const EVENT_TIME_UP = 8;

export function createWorld() {
  const state = {
    difficulty: 'classic',
    levelIndex: 0,
    found: new Set(),
    score: 0,
    totalScore: 0,
    combo: 0,
    bestCombo: 0,
    misses: 0,
    hintsLeft: HINTS_PER_LEVEL,
    timeLeft: DIFFICULTY.classic.seconds,
    levelTime: DIFFICULTY.classic.seconds,
    stars: {},
    unlocked: 1,
    levelDone: false,
    timeUp: false,
    hintPulse: null,
    marks: [],
    particles: [],
    lastFound: null,
  };

  function scene() {
    return SCENES[state.levelIndex];
  }

  function startLevel(index) {
    state.levelIndex = index;
    state.found = new Set();
    state.score = 0;
    state.combo = 0;
    state.misses = 0;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.levelTime = DIFFICULTY[state.difficulty].seconds;
    state.timeLeft = state.levelTime;
    state.levelDone = false;
    state.timeUp = false;
    state.hintPulse = null;
    state.marks = [];
    state.particles = [];
    state.lastFound = null;
  }

  function setDifficulty(key) {
    if (DIFFICULTY[key]) state.difficulty = key;
  }

  /** Distance in scene-fraction units from (fx, fy) to a difference's centre. */
  function hitDifference(fx, fy) {
    const current = scene();
    for (const diff of current.diffs) {
      if (state.found.has(diff.id)) continue;
      const dx = (fx - diff.x) * 600;
      const dy = (fy - diff.y) * 420;
      if (Math.hypot(dx, dy) <= diff.r + 10) return diff;
    }
    return null;
  }

  /**
   * Mark a point (fx, fy are 0..1 fractions of a panel, `panel` is 'left' or
   * 'right'). Returns an event mask and, when a difference was found, its id.
   */
  function mark(fx, fy, panel) {
    if (state.levelDone || state.timeUp) return { events: 0, diff: null };
    const diff = hitDifference(fx, fy);
    if (diff) {
      state.found.add(diff.id);
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      const bonus = Math.min((state.combo - 1) * POINTS_COMBO_STEP, POINTS_COMBO_CAP);
      state.score += POINTS_FOUND + bonus;
      state.lastFound = diff;
      state.particles.push({ x: fx, y: fy, born: performance.now(), kind: 'sparkle' });
      if (state.found.size >= DIFFS_PER_LEVEL) {
        const timeBonus = Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
        state.score += timeBonus;
        state.totalScore += state.score;
        state.levelDone = true;
        state.unlocked = Math.max(state.unlocked, Math.min(SCENES.length, state.levelIndex + 2));
        state.stars[state.levelIndex] = starsForLevel();
        return { events: EVENT_FOUND | EVENT_LEVEL_DONE, diff, timeBonus };
      }
      return { events: EVENT_FOUND, diff, timeBonus: 0 };
    }
    state.misses += 1;
    state.combo = 0;
    state.score = Math.max(0, state.score - POINTS_WRONG);
    state.timeLeft = Math.max(0, state.timeLeft - TIME_PENALTY_WRONG);
    state.marks.push({ x: fx, y: fy, panel: panel || 'left', born: performance.now() });
    return { events: EVENT_WRONG, diff: null };
  }

  function useHint() {
    if (state.levelDone || state.timeUp || state.hintsLeft <= 0) return null;
    const remaining = scene().diffs.filter((d) => !state.found.has(d.id));
    if (remaining.length === 0) return null;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - POINTS_HINT);
    state.hintPulse = { id: pick.id, until: performance.now() + 2500 };
    return pick;
  }

  function starsForLevel() {
    if (state.misses <= 1 && state.timeLeft >= 25) return 3;
    if (state.misses <= 4) return 2;
    return 1;
  }

  /** Advance the timer; returns an event mask. */
  function tick(dt) {
    if (state.levelDone || state.timeUp) return 0;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.timeUp = true;
      return EVENT_TIME_UP;
    }
    return 0;
  }

  return { state, scene, startLevel, setDifficulty, mark, useHint, tick, starsForLevel };
}
