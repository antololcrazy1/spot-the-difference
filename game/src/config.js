// Difference Detective — tuning, levels and palette in one place.
// The playfield is two 600x420 scene panels; the renderer scales them to the
// window, so no rule below depends on the screen size.
export const PANEL = { width: 600, height: 420 };

export const DIFFICULTY = {
  relaxed: { label: 'Relaxed', seconds: 120, blurb: 'Two calm minutes per scene' },
  classic: { label: 'Classic', seconds: 90, blurb: 'The usual ninety seconds' },
  rush: { label: 'Rush', seconds: 60, blurb: 'One fast minute, no mercy' },
};

export const DIFFS_PER_LEVEL = 6;
export const HINTS_PER_LEVEL = 3;
export const POINTS_FOUND = 100;
export const POINTS_COMBO_STEP = 25;
export const POINTS_COMBO_CAP = 100;
export const POINTS_WRONG = 25;
export const TIME_PENALTY_WRONG = 3;
export const POINTS_HINT = 50;
export const TIME_BONUS_PER_SECOND = 5;

/** Where the best total and the per-level stars are kept (this browser only). */
export const BEST_KEY = 'difference-detective.best';
export const STARS_KEY = 'difference-detective.stars';
export const DIFF_KEY = 'difference-detective.difficulty';

export const PALETTE = {
  backdrop: '#141821',
  panelGap: '#0c0e14',
  ink: '#f4f6fb',
  muted: '#9aa3b5',
  accent: '#ffb020',
  accentInk: '#2a1c00',
  good: '#37d67a',
  bad: '#ff5a5a',
  hint: '#4fc3f7',
  card: '#1d2330',
  cardEdge: '#2e3748',
  button: '#2b6cb0',
  buttonInk: '#ffffff',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
