// Difference Detective — drawing only: the world state and the current screen
// in, pixels out. The two scene panels are pre-rendered to offscreen canvases
// when a level starts; each frame paints them, the found rings, the hint
// pulse, the wrong-click marks, the sparkles and the magnifier lens.
import { FONT, PALETTE, PANEL } from './config.js';
import { alteredSet, drawScene } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_LEVELS = 'levels';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_DONE = 'level-done';
export const SCREEN_GAME_DONE = 'game-done';
export const SCREEN_TIMEOUT = 'timeout';

const LENS_RADIUS = 88;
const LENS_ZOOM = 2;

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const base = document.createElement('canvas');
  const altered = document.createElement('canvas');
  base.width = PANEL.width * 2;
  base.height = PANEL.height * 2;
  altered.width = PANEL.width * 2;
  altered.height = PANEL.height * 2;
  let preparedScene = null;

  function prepareLevel(scene) {
    const bctx = base.getContext('2d');
    const actx = altered.getContext('2d');
    bctx.scale(2, 2);
    actx.scale(2, 2);
    drawScene(bctx, scene, new Set());
    drawScene(actx, scene, alteredSet(scene));
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    actx.setTransform(1, 0, 0, 1, 0, 0);
    preparedScene = scene;
  }

  function layout() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const pad = 12;
    const gap = 16;
    const labelH = 26;
    if (w >= h * 1.05) {
      let panelW = (w - pad * 2 - gap) / 2;
      let panelH = (panelW * PANEL.height) / PANEL.width;
      const maxH = h - pad * 2 - labelH;
      if (panelH > maxH) {
        panelH = maxH;
        panelW = (panelH * PANEL.width) / PANEL.height;
      }
      const totalW = panelW * 2 + gap;
      const x0 = (w - totalW) / 2;
      const y0 = pad + labelH + (h - pad * 2 - labelH - panelH) / 2;
      return {
        landscape: true,
        left: { x: x0, y: y0, w: panelW, h: panelH, labelY: y0 - labelH },
        right: { x: x0 + panelW + gap, y: y0, w: panelW, h: panelH, labelY: y0 - labelH },
      };
    }
    let panelW = w - pad * 2;
    let panelH = (panelW * PANEL.height) / PANEL.width;
    const maxH = (h - pad * 2 - gap - labelH * 2) / 2;
    if (panelH > maxH) {
      panelH = maxH;
      panelW = (panelH * PANEL.width) / PANEL.height;
    }
    const totalH = panelH * 2 + gap + labelH * 2;
    const y0 = (h - totalH) / 2;
    const x0 = (w - panelW) / 2;
    return {
      landscape: false,
      left: { x: x0, y: y0 + labelH, w: panelW, h: panelH, labelY: y0 },
      right: { x: x0, y: y0 + labelH + panelH + gap + labelH, w: panelW, h: panelH, labelY: y0 + labelH + panelH + gap },
    };
  }

  /** Which panel (if any) a canvas-fraction point is on, and its panel fractions. */
  function panelAt(fx, fy) {
    const rects = layout();
    const px = fx * canvas.clientWidth;
    const py = fy * canvas.clientHeight;
    for (const side of ['left', 'right']) {
      const r = rects[side];
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
        return { side, fx: (px - r.x) / r.w, fy: (py - r.y) / r.h, rect: r };
      }
    }
    return { side: null, fx: 0, fy: 0, rect: null };
  }

  function roundClip(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawRing(rect, diff, color, width, pulse, now) {
    const cx = rect.x + diff.x * rect.w;
    const cy = rect.y + diff.y * rect.h;
    const r = (diff.r / PANEL.width) * rect.w * (pulse ? 1 + 0.12 * Math.sin(now / 180) : 1);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(10, r), 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawLens(rects, lens, lensOn) {
    if (!lensOn || !lens.visible) return;
    const px = lens.x * canvas.clientWidth;
    const py = lens.y * canvas.clientHeight;
    const hit = panelAt(lens.x, lens.y);
    if (!hit.side) return;
    const source = hit.side === 'left' ? base : altered;
    const rect = rects[hit.side];
    const scaleX = base.width / rect.w;
    const srcSize = (LENS_RADIUS * 2) / LENS_ZOOM;
    const sx = hit.fx * base.width - (srcSize * scaleX) / 2;
    const sy = hit.fy * base.height - (srcSize * scaleX) / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, LENS_RADIUS, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(source, sx, sy, srcSize * scaleX, srcSize * scaleX, px - LENS_RADIUS, py - LENS_RADIUS, LENS_RADIUS * 2, LENS_RADIUS * 2);
    ctx.restore();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, py, LENS_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px - 10, py);
    ctx.lineTo(px + 10, py);
    ctx.moveTo(px, py - 10);
    ctx.lineTo(px, py + 10);
    ctx.stroke();
  }

  function draw(world, screen, ui) {
    const state = world.state;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, cssW, cssH);

    const rects = layout();
    const scene = world.scene();
    if (!preparedScene || preparedScene.id !== scene.id) {
      prepareLevel(scene);
    }
    const now = ui.now ?? performance.now();

    // Panel labels.
    ctx.font = `700 15px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (const [side, tag] of [['left', 'A — Original'], ['right', 'B — Changed']]) {
      const r = rects[side];
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText(tag, r.x + 2, r.labelY + 13);
    }

    // Panels.
    for (const [side, source] of [['left', base], ['right', altered]]) {
      const r = rects[side];
      ctx.save();
      roundClip(r.x, r.y, r.w, r.h, 12);
      ctx.clip();
      ctx.drawImage(source, r.x, r.y, r.w, r.h);
      ctx.restore();
      ctx.strokeStyle = PALETTE.cardEdge;
      ctx.lineWidth = 2;
      roundClip(r.x, r.y, r.w, r.h, 12);
      ctx.stroke();
    }

    if (!state) return;

    // Found rings on both panels.
    for (const diff of scene.diffs) {
      if (!state.found.has(diff.id)) continue;
      const isLast = state.lastFound && state.lastFound.id === diff.id;
      drawRing(rects.left, diff, PALETTE.good, isLast ? 5 : 4, isLast, now);
      drawRing(rects.right, diff, PALETTE.good, isLast ? 5 : 4, isLast, now);
    }

    // Hint pulse on both panels.
    if (state.hintPulse && now < state.hintPulse.until) {
      const diff = scene.diffs.find((d) => d.id === state.hintPulse.id);
      if (diff) {
        drawRing(rects.left, diff, PALETTE.hint, 4, true, now);
        drawRing(rects.right, diff, PALETTE.hint, 4, true, now);
      }
    }

    // Wrong-click marks fade out over 0.9 s.
    state.marks = state.marks.filter((m) => now - m.born < 900);
    for (const mark of state.marks) {
      const age = (now - mark.born) / 900;
      const rect = rects[mark.panel] || rects.left;
      const cx = rect.x + mark.x * rect.w;
      const cy = rect.y + mark.y * rect.h;
      ctx.globalAlpha = 1 - age;
      ctx.strokeStyle = PALETTE.bad;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const s = 10;
      ctx.beginPath();
      ctx.moveTo(cx - s, cy - s);
      ctx.lineTo(cx + s, cy + s);
      ctx.moveTo(cx + s, cy - s);
      ctx.lineTo(cx - s, cy + s);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Sparkles where a difference was just found.
    state.particles = state.particles.filter((p) => now - p.born < 700);
    for (const p of state.particles) {
      const age = (now - p.born) / 700;
      for (const rect of [rects.left, rects.right]) {
        const cx = rect.x + p.x * rect.w;
        const cy = rect.y + p.y * rect.h;
        ctx.globalAlpha = 1 - age;
        ctx.strokeStyle = '#ffd93b';
        ctx.lineWidth = 2.5;
        const len = 6 + age * 14;
        for (let i = 0; i < 8; i += 1) {
          const a = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a) * len * 0.5, cy + Math.sin(a) * len * 0.5);
          ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Magnifier lens and keyboard crosshair, only while playing.
    if (screen === SCREEN_PLAY) {
      drawLens(rects, ui.lens, ui.lensOn);
      if (ui.crosshair.active) {
        const cx = ui.crosshair.x * cssW;
        const cy = ui.crosshair.y * cssH;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 18, cy);
        ctx.lineTo(cx - 6, cy);
        ctx.moveTo(cx + 6, cy);
        ctx.lineTo(cx + 18, cy);
        ctx.moveTo(cx, cy - 18);
        ctx.lineTo(cx, cy - 6);
        ctx.moveTo(cx, cy + 6);
        ctx.lineTo(cx, cy + 18);
        ctx.stroke();
      }
    }
  }

  return { draw, layout, panelAt, prepareLevel };
}
