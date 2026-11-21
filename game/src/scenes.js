// Difference Detective — the six scenes. Every scene is drawn procedurally with
// smooth vector shapes (gradients, soft shadows, rounded forms): no pixel art,
// no image files. Each scene draws two versions: the base one, and the altered
// one with `applied` differences switched on. A difference is a circle in
// scene-fraction coordinates (x, y in 0..1 of the 600x420 panel, r in px).
import { PANEL } from './config.js';

const W = PANEL.width;
const H = PANEL.height;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function fillCircle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  circle(ctx, x, y, r);
  ctx.fill();
}

function star5(ctx, x, y, r, color, rot = -Math.PI / 2) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = rot + (i * Math.PI) / 5;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function vgrad(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [offset, color] of stops) g.addColorStop(offset, color);
  return g;
}

function cloud(ctx, x, y, s, color = '#ffffff') {
  ctx.fillStyle = color;
  circle(ctx, x, y, 18 * s);
  ctx.fill();
  circle(ctx, x + 20 * s, y + 4 * s, 14 * s);
  ctx.fill();
  circle(ctx, x - 20 * s, y + 5 * s, 13 * s);
  ctx.fill();
  ctx.fillRect(x - 30 * s, y, 60 * s, 14 * s);
}

function bird(ctx, x, y, s, color = '#3a3a3a') {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y);
  ctx.quadraticCurveTo(x - 5 * s, y - 8 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 8 * s, x + 12 * s, y);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Scene 1 — Sunny Park
// ---------------------------------------------------------------------------
function drawPark(ctx, applied) {
  ctx.fillStyle = vgrad(ctx, 0, 260, [[0, '#6ec1f5'], [1, '#cfeeff']]);
  ctx.fillRect(0, 0, W, 265);
  ctx.fillStyle = vgrad(ctx, 260, H, [[0, '#8ed95e'], [1, '#4da33f']]);
  ctx.fillRect(0, 260, W, H - 260);

  // Sun with rays.
  ctx.fillStyle = '#ffd93b';
  for (let i = 0; i < 12; i += 1) {
    const a = (i * Math.PI) / 6;
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(90 + Math.cos(a) * 46, 70 + Math.sin(a) * 46);
    ctx.lineTo(90 + Math.cos(a) * 58, 70 + Math.sin(a) * 58);
    ctx.stroke();
  }
  fillCircle(ctx, 90, 70, 38, '#ffd93b');
  fillCircle(ctx, 78, 62, 5, '#3a2b00');
  fillCircle(ctx, 102, 62, 5, '#3a2b00');
  ctx.strokeStyle = '#3a2b00';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(90, 76, 12, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (applied.has('sunglasses')) {
    ctx.fillStyle = '#22242a';
    rr(ctx, 66, 56, 20, 12, 6);
    ctx.fill();
    rr(ctx, 94, 56, 20, 12, 6);
    ctx.fill();
    ctx.fillRect(84, 60, 12, 4);
  }

  cloud(ctx, 200, 60, 1);
  cloud(ctx, 380, 45, 0.85);
  if (!applied.has('cloud')) cloud(ctx, 500, 80, 0.9);
  bird(ctx, 300, 90, 1);
  if (applied.has('bird')) bird(ctx, 350, 70, 0.9);

  // Pond, bottom left.
  ctx.fillStyle = '#5db9e8';
  ctx.beginPath();
  ctx.ellipse(130, 350, 75, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(130, 348, 50, 14, 0, 0.2, Math.PI * 0.9);
  ctx.stroke();

  // Big tree, right.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(512, 250, 16, 70);
  fillCircle(ctx, 520, 225, 42, '#2f9e44');
  fillCircle(ctx, 490, 245, 30, '#37b24d');
  fillCircle(ctx, 550, 245, 30, '#2b8a3e');

  // Bench.
  ctx.fillStyle = '#8d5a2b';
  ctx.fillRect(270, 285, 90, 10);
  ctx.fillRect(270, 300, 90, 10);
  if (!applied.has('slats')) ctx.fillRect(270, 270, 90, 8);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(276, 310, 8, 28);
  ctx.fillRect(346, 310, 8, 28);

  // Kite.
  const kiteColor = applied.has('kite') ? '#4dabf7' : '#fa5252';
  ctx.fillStyle = kiteColor;
  ctx.beginPath();
  ctx.moveTo(430, 105);
  ctx.lineTo(452, 130);
  ctx.lineTo(430, 155);
  ctx.lineTo(408, 130);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(430, 155);
  ctx.lineTo(430, 195);
  ctx.stroke();
  fillCircle(ctx, 430, 168, 4, '#ffd93b');
  fillCircle(ctx, 430, 182, 4, '#ffd93b');

  // Dog.
  ctx.fillStyle = '#c08552';
  ctx.beginPath();
  ctx.ellipse(180, 305, 26, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  fillCircle(ctx, 202, 292, 13, '#c08552');
  fillCircle(ctx, 196, 280, 5, '#8d5a2b');
  ctx.fillStyle = '#8d5a2b';
  ctx.beginPath();
  ctx.ellipse(156, 292, 12, 4, -0.6, 0, Math.PI * 2);
  ctx.fill();
  fillCircle(ctx, 206, 288, 2.5, '#222');

  // Flowers along the bottom.
  const flowers = [
    [240, '#fa5252'],
    [300, '#ff922b'],
    [360, '#e599f7'],
    [420, '#9775fa'],
    [480, '#ffd43b'],
  ];
  for (const [fx, color] of flowers) {
    if (applied.has('flower') && fx === 240) continue;
    ctx.strokeStyle = '#2f9e44';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fx, 385);
    ctx.lineTo(fx, 405);
    ctx.stroke();
    fillCircle(ctx, fx, 378, 9, color);
    fillCircle(ctx, fx, 378, 3.5, '#fff3bf');
  }
}

const PARK_DIFFS = [
  { id: 'sunglasses', x: 0.15, y: 0.167, r: 42, label: 'The sun wears sunglasses' },
  { id: 'flower', x: 0.4, y: 0.9, r: 18, label: 'A red flower is missing' },
  { id: 'kite', x: 0.717, y: 0.31, r: 28, label: 'The kite changed colour' },
  { id: 'bird', x: 0.583, y: 0.167, r: 20, label: 'An extra bird appeared' },
  { id: 'slats', x: 0.525, y: 0.69, r: 34, label: 'A bench slat is missing' },
  { id: 'cloud', x: 0.833, y: 0.19, r: 32, label: 'A cloud drifted away' },
];

// ---------------------------------------------------------------------------
// Scene 2 — Beach Sunset
// ---------------------------------------------------------------------------
function drawBeach(ctx, applied) {
  ctx.fillStyle = vgrad(ctx, 0, 240, [[0, '#ff9a56'], [0.55, '#ff5e78'], [1, '#c77dff']]);
  ctx.fillRect(0, 0, W, 245);
  ctx.fillStyle = vgrad(ctx, 240, 330, [[0, '#7b5cff'], [1, '#2e86ab']]);
  ctx.fillRect(0, 240, W, 90);
  ctx.fillStyle = vgrad(ctx, 330, H, [[0, '#f7d794'], [1, '#e8a85c']]);
  ctx.fillRect(0, 330, W, H - 330);

  // Low sun and its reflection.
  fillCircle(ctx, 300, 205, 52, '#ffdf6b');
  ctx.fillStyle = 'rgba(255,223,107,0.55)';
  ctx.fillRect(288, 240, 24, 26);
  ctx.fillRect(282, 268, 36, 18);
  if (!applied.has('reflection')) {
    ctx.fillStyle = 'rgba(255,223,107,0.75)';
    ctx.fillRect(292, 292, 16, 30);
  }

  bird(ctx, 150, 80, 1, '#4a2b2b');
  bird(ctx, 220, 60, 0.9, '#4a2b2b');
  if (applied.has('gull')) bird(ctx, 420, 70, 1, '#4a2b2b');

  // Boat on the sea.
  ctx.fillStyle = '#8d5a2b';
  ctx.beginPath();
  ctx.moveTo(70, 272);
  ctx.lineTo(120, 272);
  ctx.lineTo(110, 288);
  ctx.lineTo(80, 288);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(95, 268);
  ctx.lineTo(95, 232);
  ctx.lineTo(122, 268);
  ctx.closePath();
  ctx.fill();

  // Palm tree, right.
  ctx.strokeStyle = '#7a5230';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(520, 330);
  ctx.quadraticCurveTo(528, 280, 520, 235);
  ctx.stroke();
  ctx.strokeStyle = '#2f9e44';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  for (const [dx, dy] of [[-38, -8], [-28, -26], [0, -32], [28, -26], [38, -8]]) {
    ctx.beginPath();
    ctx.moveTo(520, 235);
    ctx.quadraticCurveTo(520 + dx * 0.6, 235 + dy * 0.6, 520 + dx, 235 + dy);
    ctx.stroke();
  }
  fillCircle(ctx, 512, 242, 8, '#8d5a2b');
  fillCircle(ctx, 528, 244, 8, '#8d5a2b');

  // Beach umbrella.
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(140, 300);
  ctx.lineTo(140, 380);
  ctx.stroke();
  const umbrellaColor = applied.has('umbrella') ? '#20c997' : '#fa5252';
  ctx.fillStyle = umbrellaColor;
  ctx.beginPath();
  ctx.moveTo(140, 292);
  ctx.arc(140, 292, 52, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(140, 292);
  ctx.arc(140, 292, 52, Math.PI * 1.25, Math.PI * 1.75);
  ctx.closePath();
  ctx.fill();
  fillCircle(ctx, 140, 288, 5, '#ffd93b');

  // Sandcastle with flag.
  ctx.fillStyle = '#e8c07a';
  ctx.fillRect(310, 340, 44, 34);
  ctx.fillRect(300, 330, 64, 12);
  fillCircle(ctx, 318, 330, 9, '#e8c07a');
  fillCircle(ctx, 346, 330, 9, '#e8c07a');
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(332, 330);
  ctx.lineTo(332, 300);
  ctx.stroke();
  if (!applied.has('flag')) {
    ctx.fillStyle = '#fa5252';
    ctx.beginPath();
    ctx.moveTo(332, 300);
    ctx.lineTo(352, 306);
    ctx.lineTo(332, 312);
    ctx.closePath();
    ctx.fill();
  }

  // Starfish and crab on the sand.
  if (!applied.has('starfish')) star5(ctx, 470, 385, 14, '#ff922b');
  if (!applied.has('crab')) {
    fillCircle(ctx, 230, 390, 12, '#e03131');
    fillCircle(ctx, 218, 384, 4, '#e03131');
    fillCircle(ctx, 242, 384, 4, '#e03131');
    ctx.strokeStyle = '#e03131';
    ctx.lineWidth = 3;
    for (const lx of [222, 230, 238]) {
      ctx.beginPath();
      ctx.moveTo(lx, 400);
      ctx.lineTo(lx - 4, 408);
      ctx.stroke();
    }
  }
}

const BEACH_DIFFS = [
  { id: 'reflection', x: 0.5, y: 0.726, r: 30, label: 'The sun reflection is gone' },
  { id: 'starfish', x: 0.783, y: 0.917, r: 20, label: 'A starfish vanished' },
  { id: 'umbrella', x: 0.233, y: 0.693, r: 36, label: 'The umbrella changed colour' },
  { id: 'gull', x: 0.7, y: 0.167, r: 18, label: 'An extra seagull appeared' },
  { id: 'flag', x: 0.553, y: 0.726, r: 20, label: 'The castle flag is missing' },
  { id: 'crab', x: 0.383, y: 0.929, r: 22, label: 'The crab scuttled away' },
];

// ---------------------------------------------------------------------------
// Scene 3 — Cozy Kitchen
// ---------------------------------------------------------------------------
function drawKitchen(ctx, applied) {
  ctx.fillStyle = '#ffe8c2';
  ctx.fillRect(0, 0, W, 300);
  ctx.fillStyle = '#c98f5f';
  ctx.fillRect(0, 300, W, H - 300);
  ctx.fillStyle = '#a86f42';
  ctx.fillRect(0, 296, W, 8);

  // Window with sky and sun.
  ctx.fillStyle = '#ffffff';
  rr(ctx, 70, 50, 170, 150, 10);
  ctx.fill();
  ctx.fillStyle = '#aee6ff';
  ctx.fillRect(82, 62, 146, 126);
  fillCircle(ctx, 190, 100, 24, '#ffd93b');
  cloud(ctx, 130, 90, 0.6);
  ctx.fillStyle = '#2f9e44';
  ctx.fillRect(82, 168, 146, 20);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(155, 62);
  ctx.lineTo(155, 188);
  ctx.moveTo(82, 125);
  ctx.lineTo(228, 125);
  ctx.stroke();
  // Curtains.
  ctx.fillStyle = '#fa5252';
  ctx.fillRect(64, 44, 26, 120);
  ctx.fillRect(214, 44, 26, 120);

  // Wall clock.
  fillCircle(ctx, 450, 90, 32, '#ffffff');
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 3;
  circle(ctx, 450, 90, 32);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(450, 90);
  if (applied.has('clock')) ctx.lineTo(450, 66);
  else ctx.lineTo(472, 90);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(450, 90);
  ctx.lineTo(450, 112);
  ctx.stroke();
  fillCircle(ctx, 450, 90, 3, '#333');

  // Shelf with mugs.
  ctx.fillStyle = '#8d5a2b';
  ctx.fillRect(490, 150, 80, 8);
  const mugColor = applied.has('mug') ? '#20c997' : '#4dabf7';
  ctx.fillStyle = mugColor;
  rr(ctx, 500, 122, 24, 28, 4);
  ctx.fill();
  ctx.fillStyle = '#ff922b';
  rr(ctx, 534, 122, 24, 28, 4);
  ctx.fill();

  // Plant on the windowsill.
  ctx.fillStyle = '#e07b39';
  ctx.beginPath();
  ctx.moveTo(168, 196);
  ctx.lineTo(192, 196);
  ctx.lineTo(188, 216);
  ctx.lineTo(172, 216);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2f9e44';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(180, 196);
  ctx.quadraticCurveTo(168, 172, 158, 160);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(180, 196);
  ctx.quadraticCurveTo(180, 168, 180, 152);
  ctx.stroke();
  if (!applied.has('leaf')) {
    ctx.beginPath();
    ctx.moveTo(180, 196);
    ctx.quadraticCurveTo(194, 172, 204, 162);
    ctx.stroke();
  }

  // Table.
  ctx.fillStyle = '#a86f42';
  rr(ctx, 220, 300, 260, 16, 6);
  ctx.fill();
  ctx.fillRect(240, 316, 12, 60);
  ctx.fillRect(448, 316, 12, 60);

  // Cake with a cherry.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(262, 296, 34, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f783ac';
  rr(ctx, 244, 272, 36, 24, 6);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(244, 272, 36, 8);
  if (!applied.has('cherry')) fillCircle(ctx, 262, 268, 6, '#e03131');

  // Kettle.
  ctx.fillStyle = '#495057';
  ctx.beginPath();
  ctx.ellipse(336, 290, 24, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(330, 258, 12, 22);
  ctx.beginPath();
  ctx.moveTo(358, 272);
  ctx.quadraticCurveTo(376, 268, 374, 252);
  ctx.lineTo(368, 252);
  ctx.quadraticCurveTo(368, 264, 356, 266);
  ctx.closePath();
  ctx.fill();

  // Fruit bowl.
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.ellipse(432, 286, 30, 12, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillRect(402, 286, 60, 6);
  fillCircle(ctx, 420, 276, 9, '#fa5252');
  if (!applied.has('apple')) fillCircle(ctx, 438, 272, 9, '#e03131');
  fillCircle(ctx, 448, 280, 8, '#ff922b');

  // Cat asleep on a chair, bottom left.
  ctx.fillStyle = '#8d5a2b';
  rr(ctx, 90, 330, 90, 12, 6);
  ctx.fill();
  ctx.fillRect(96, 342, 8, 34);
  ctx.fillRect(166, 342, 8, 34);
  ctx.fillStyle = '#ff922b';
  ctx.beginPath();
  ctx.ellipse(128, 322, 30, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  fillCircle(ctx, 152, 310, 13, '#ff922b');
  ctx.beginPath();
  ctx.moveTo(144, 300);
  ctx.lineTo(148, 290);
  ctx.lineTo(154, 299);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(156, 299);
  ctx.lineTo(162, 290);
  ctx.lineTo(164, 301);
  ctx.closePath();
  ctx.fill();
  if (applied.has('cat')) {
    fillCircle(ctx, 148, 308, 2, '#222');
    fillCircle(ctx, 156, 308, 2, '#222');
  }
}

const KITCHEN_DIFFS = [
  { id: 'clock', x: 0.75, y: 0.214, r: 34, label: 'The clock shows a different time' },
  { id: 'apple', x: 0.73, y: 0.648, r: 22, label: 'An apple is missing from the bowl' },
  { id: 'cat', x: 0.253, y: 0.738, r: 28, label: 'The cat opened its eyes' },
  { id: 'mug', x: 0.853, y: 0.324, r: 22, label: 'A mug changed colour' },
  { id: 'leaf', x: 0.317, y: 0.419, r: 20, label: 'A plant leaf is missing' },
  { id: 'cherry', x: 0.437, y: 0.638, r: 18, label: 'The cherry is gone from the cake' },
];

// ---------------------------------------------------------------------------
// Scene 4 — Space Adventure
// ---------------------------------------------------------------------------
function drawSpace(ctx, applied) {
  ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#0b1035'], [1, '#1b2a6b']]);
  ctx.fillRect(0, 0, W, H);

  // Stars.
  const stars = [
    [60, 50, 3], [150, 40, 2], [240, 70, 3], [330, 45, 2], [520, 40, 3],
    [90, 140, 2], [260, 120, 2], [380, 160, 3], [560, 120, 2], [40, 220, 3],
    [540, 200, 2], [30, 330, 2], [580, 300, 3], [200, 380, 2], [420, 390, 3],
  ];
  for (const [sx, sy, sr] of stars) {
    if (applied.has('star') && sx === 120 && sy === 60) continue;
    star5(ctx, sx, sy, sr + 2, '#ffffff');
  }
  if (!applied.has('star')) star5(ctx, 120, 60, 5, '#ffffff');

  // Ringed planet.
  fillCircle(ctx, 430, 130, 52, '#9775fa');
  ctx.fillStyle = 'rgba(151,117,250,0.55)';
  ctx.beginPath();
  ctx.ellipse(430, 130, 52, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  fillCircle(ctx, 430, 130, 52, 'rgba(151,117,250,0.85)');
  if (!applied.has('ring')) {
    ctx.strokeStyle = '#ffd93b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(430, 130, 78, 18, -0.25, 0, Math.PI * 2);
    ctx.stroke();
  }
  fillCircle(ctx, 412, 116, 8, '#7a5af8');
  fillCircle(ctx, 448, 146, 6, '#7a5af8');

  // Comet.
  if (!applied.has('comet')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(480, 60);
    ctx.lineTo(430, 95);
    ctx.stroke();
    fillCircle(ctx, 482, 58, 8, '#fff3bf');
  }

  // Rocket.
  ctx.fillStyle = '#dee2e6';
  ctx.beginPath();
  ctx.moveTo(180, 150);
  ctx.quadraticCurveTo(200, 170, 200, 205);
  ctx.lineTo(160, 205);
  ctx.quadraticCurveTo(160, 170, 180, 150);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fa5252';
  ctx.beginPath();
  ctx.moveTo(160, 200);
  ctx.lineTo(142, 222);
  ctx.lineTo(160, 216);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(200, 200);
  ctx.lineTo(218, 222);
  ctx.lineTo(200, 216);
  ctx.closePath();
  ctx.fill();
  fillCircle(ctx, 180, 182, 10, '#4dabf7');
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  circle(ctx, 180, 182, 10);
  ctx.stroke();
  if (!applied.has('flame')) {
    ctx.fillStyle = '#ff922b';
    ctx.beginPath();
    ctx.moveTo(168, 206);
    ctx.lineTo(180, 236);
    ctx.lineTo(192, 206);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd93b';
    ctx.beginPath();
    ctx.moveTo(173, 206);
    ctx.lineTo(180, 224);
    ctx.lineTo(187, 206);
    ctx.closePath();
    ctx.fill();
  }

  // Astronaut floating.
  ctx.fillStyle = '#f1f3f5';
  rr(ctx, 288, 288, 26, 40, 10);
  ctx.fill();
  fillCircle(ctx, 301, 276, 15, '#f1f3f5');
  fillCircle(ctx, 301, 276, 11, '#4dabf7');
  ctx.fillStyle = '#adb5bd';
  rr(ctx, 282, 292, 8, 22, 4);
  ctx.fill();
  rr(ctx, 314, 292, 8, 22, 4);
  ctx.fill();
  const patchColor = applied.has('patch') ? '#ffd93b' : '#fa5252';
  fillCircle(ctx, 301, 306, 5, patchColor);
  ctx.strokeStyle = '#adb5bd';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(288, 330);
  ctx.lineTo(282, 348);
  ctx.moveTo(314, 330);
  ctx.lineTo(320, 348);
  ctx.stroke();

  // Moon with craters.
  fillCircle(ctx, 520, 330, 36, '#e9ecef');
  fillCircle(ctx, 508, 320, 7, '#ced4da');
  fillCircle(ctx, 530, 336, 5, '#ced4da');
  fillCircle(ctx, 522, 314, 4, '#ced4da');

  // UFO.
  ctx.fillStyle = '#868e96';
  ctx.beginPath();
  ctx.ellipse(90, 330, 42, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(173,181,189,0.9)';
  ctx.beginPath();
  ctx.arc(90, 326, 18, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  const domeColor = applied.has('ufo') ? '#fa5252' : '#37d67a';
  fillCircle(ctx, 70, 332, 4, domeColor);
  fillCircle(ctx, 90, 334, 4, domeColor);
  fillCircle(ctx, 110, 332, 4, domeColor);
}

const SPACE_DIFFS = [
  { id: 'star', x: 0.2, y: 0.143, r: 16, label: 'A star winked out' },
  { id: 'ring', x: 0.717, y: 0.31, r: 62, label: 'The planet lost its ring' },
  { id: 'flame', x: 0.3, y: 0.524, r: 28, label: 'The rocket flame went out' },
  { id: 'ufo', x: 0.15, y: 0.79, r: 30, label: 'The UFO lights changed colour' },
  { id: 'patch', x: 0.502, y: 0.729, r: 22, label: 'The astronaut patch changed colour' },
  { id: 'comet', x: 0.803, y: 0.138, r: 24, label: 'A comet disappeared' },
];

// ---------------------------------------------------------------------------
// Scene 5 — Coral Reef
// ---------------------------------------------------------------------------
function drawReef(ctx, applied) {
  ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#1e90ff'], [1, '#004e89']]);
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = vgrad(ctx, 390, H, [[0, '#f2d8a7'], [1, '#d9b77c']]);
  ctx.fillRect(0, 390, W, H - 390);

  // Sunlight rays.
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (const [rx, rw] of [[120, 26], [300, 20], [470, 30]]) {
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx + rw, 0);
    ctx.lineTo(rx + rw + 60, 390);
    ctx.lineTo(rx + 60, 390);
    ctx.closePath();
    ctx.fill();
  }

  // Seaweed, left and right.
  function seaweed(x, present) {
    ctx.strokeStyle = '#2f9e44';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, 392);
    ctx.quadraticCurveTo(x - 14, 350, x + 4, 318);
    ctx.stroke();
    if (present) {
      ctx.beginPath();
      ctx.moveTo(x + 14, 392);
      ctx.quadraticCurveTo(x + 28, 356, x + 16, 326);
      ctx.stroke();
    }
  }
  seaweed(60, true);
  seaweed(556, !applied.has('weed'));

  // Pink branching coral, left.
  ctx.strokeStyle = '#f783ac';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(90, 392);
  ctx.lineTo(90, 340);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(90, 360);
  ctx.quadraticCurveTo(66, 344, 62, 322);
  ctx.stroke();
  const branchColor = applied.has('coral') ? '#ff922b' : '#f783ac';
  ctx.strokeStyle = branchColor;
  ctx.beginPath();
  ctx.moveTo(90, 352);
  ctx.quadraticCurveTo(116, 336, 120, 314);
  ctx.stroke();

  // Orange coral, right.
  ctx.strokeStyle = '#ff922b';
  ctx.beginPath();
  ctx.moveTo(500, 392);
  ctx.lineTo(500, 350);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(500, 368);
  ctx.quadraticCurveTo(482, 352, 480, 334);
  ctx.stroke();

  // Fish.
  function fish(x, y, color, flip) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + (flip ? 18 : -18), y);
    ctx.lineTo(x + (flip ? 30 : -30), y - 10);
    ctx.lineTo(x + (flip ? 30 : -30), y + 10);
    ctx.closePath();
    ctx.fill();
    fillCircle(ctx, x + (flip ? -8 : 8), y - 3, 2.5, '#222');
  }
  fish(300, 120, '#ff922b', false);
  fish(340, 150, applied.has('fish') ? '#9775fa' : '#ff922b', true);
  fish(270, 180, '#ff922b', false);

  // Turtle.
  ctx.fillStyle = '#2f9e44';
  ctx.beginPath();
  ctx.ellipse(450, 250, 34, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#37b24d';
  ctx.beginPath();
  ctx.ellipse(450, 250, 24, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!applied.has('turtle')) star5(ctx, 450, 250, 7, '#ffd93b');
  fillCircle(ctx, 486, 246, 10, '#2f9e44');
  fillCircle(ctx, 490, 242, 2, '#222');
  ctx.strokeStyle = '#2f9e44';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(424, 262);
  ctx.lineTo(412, 274);
  ctx.moveTo(424, 238);
  ctx.lineTo(412, 226);
  ctx.moveTo(472, 262);
  ctx.lineTo(484, 274);
  ctx.moveTo(472, 238);
  ctx.lineTo(484, 226);
  ctx.stroke();

  // Bubbles rising.
  const bubbles = [[200, 300, 7], [220, 260, 9], [240, 220, 6]];
  for (const [bx, by, br] of bubbles) {
    if (applied.has('bubble') && bx === 220) continue;
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2;
    circle(ctx, bx, by, br);
    ctx.stroke();
    fillCircle(ctx, bx - 2, by - 2, 2, 'rgba(255,255,255,0.7)');
  }

  // Starfish on a rock, shell on the sand.
  if (!applied.has('starfish')) star5(ctx, 520, 368, 13, '#ff6b9d');
  ctx.fillStyle = '#adb5bd';
  ctx.beginPath();
  ctx.ellipse(520, 384, 26, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f783ac';
  ctx.beginPath();
  ctx.arc(350, 398, 14, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
}

const REEF_DIFFS = [
  { id: 'fish', x: 0.567, y: 0.357, r: 24, label: 'A fish changed colour' },
  { id: 'turtle', x: 0.75, y: 0.595, r: 32, label: 'The star on the turtle shell is gone' },
  { id: 'bubble', x: 0.367, y: 0.619, r: 16, label: 'A bubble popped' },
  { id: 'starfish', x: 0.867, y: 0.876, r: 20, label: 'A starfish vanished' },
  { id: 'coral', x: 0.183, y: 0.8, r: 28, label: 'A coral branch changed colour' },
  { id: 'weed', x: 0.94, y: 0.833, r: 22, label: 'A seaweed frond is missing' },
];

// ---------------------------------------------------------------------------
// Scene 6 — Winter Village
// ---------------------------------------------------------------------------
function drawWinter(ctx, applied) {
  ctx.fillStyle = vgrad(ctx, 0, 300, [[0, '#8fb8dd'], [1, '#dfeefc']]);
  ctx.fillRect(0, 0, W, 305);
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 300, W, H - 300);

  // Snowflakes.
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (const [fx, fy] of [[50, 60], [140, 30], [230, 70], [330, 40], [420, 80], [500, 50], [560, 110], [90, 150], [300, 120], [470, 150]]) {
    fillCircle(ctx, fx, fy, 3, 'rgba(255,255,255,0.9)');
  }

  // Houses.
  function house(x, y, w, h, roofColor, litWindows) {
    ctx.fillStyle = '#f1d3a5';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + w / 2, y - 42);
    ctx.lineTo(x + w + 12, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8d5a2b';
    ctx.fillRect(x + w / 2 - 14, y + h - 48, 28, 48);
    for (const [wx, wy, lit] of litWindows) {
      ctx.fillStyle = lit ? '#ffd93b' : '#495057';
      ctx.fillRect(x + wx, y + wy, 22, 22);
    }
  }
  house(90, 210, 130, 90, '#c0392b', [[18, 20, true], [86, 20, true]]);
  house(360, 200, 140, 100, '#2b6cb0', [[20, 22, true], [92, 22, !applied.has('window')]]);

  // Chimney smoke on house one.
  if (!applied.has('smoke')) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    fillCircle(ctx, 130, 158, 10, 'rgba(255,255,255,0.85)');
    fillCircle(ctx, 138, 142, 13, 'rgba(255,255,255,0.8)');
    fillCircle(ctx, 148, 124, 16, 'rgba(255,255,255,0.7)');
  }
  ctx.fillStyle = '#868e96';
  ctx.fillRect(120, 160, 18, 30);

  // Pine tree with ornaments and star.
  ctx.fillStyle = '#2f9e44';
  ctx.beginPath();
  ctx.moveTo(520, 180);
  ctx.lineTo(560, 250);
  ctx.lineTo(480, 250);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(520, 220);
  ctx.lineTo(566, 290);
  ctx.lineTo(474, 290);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(514, 290, 12, 18);
  fillCircle(ctx, 505, 240, 4, '#fa5252');
  fillCircle(ctx, 536, 262, 4, '#ffd93b');
  fillCircle(ctx, 516, 276, 4, '#4dabf7');
  if (!applied.has('star')) star5(ctx, 520, 172, 11, '#ffd93b');

  // Lamp post.
  ctx.strokeStyle = '#343a40';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(60, 300);
  ctx.lineTo(60, 220);
  ctx.stroke();
  fillCircle(ctx, 60, 212, 9, '#ffd93b');
  ctx.fillStyle = 'rgba(255,217,59,0.25)';
  circle(ctx, 60, 212, 22);
  ctx.fill();

  // Snowman.
  fillCircle(ctx, 300, 360, 30, '#ffffff');
  fillCircle(ctx, 300, 322, 22, '#ffffff');
  fillCircle(ctx, 300, 292, 16, '#ffffff');
  ctx.fillStyle = '#222';
  fillCircle(ctx, 300, 292, 16, '#ffffff');
  fillCircle(ctx, 294, 288, 2.5, '#222');
  fillCircle(ctx, 306, 288, 2.5, '#222');
  if (!applied.has('nose')) {
    ctx.fillStyle = '#ff922b';
    ctx.beginPath();
    ctx.moveTo(300, 294);
    ctx.lineTo(322, 298);
    ctx.lineTo(300, 302);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#222';
  ctx.fillRect(288, 268, 24, 8);
  ctx.fillRect(292, 252, 16, 18);
  ctx.fillStyle = '#fa5252';
  ctx.fillRect(288, 306, 24, 7);

  // Gifts.
  ctx.fillStyle = '#4dabf7';
  ctx.fillRect(190, 356, 28, 22);
  const bowColor = applied.has('bow') ? '#4dabf7' : '#fa5252';
  fillCircle(ctx, 200, 352, 5, bowColor);
  fillCircle(ctx, 210, 352, 5, bowColor);
  ctx.fillStyle = '#9775fa';
  ctx.fillRect(224, 362, 22, 16);

  // Reindeer.
  ctx.fillStyle = '#a86f42';
  ctx.beginPath();
  ctx.ellipse(450, 360, 24, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  fillCircle(ctx, 472, 344, 11, '#a86f42');
  fillCircle(ctx, 478, 336, 4, '#a86f42');
  ctx.strokeStyle = '#7a5230';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(468, 334);
  ctx.lineTo(462, 318);
  ctx.lineTo(456, 326);
  ctx.stroke();
  if (!applied.has('antler')) {
    ctx.beginPath();
    ctx.moveTo(476, 334);
    ctx.lineTo(484, 318);
    ctx.lineTo(490, 326);
    ctx.stroke();
  }
  ctx.fillStyle = '#e03131';
  fillCircle(ctx, 482, 348, 3.5, '#e03131');
  ctx.strokeStyle = '#a86f42';
  ctx.lineWidth = 4;
  for (const lx of [434, 444, 456, 466]) {
    ctx.beginPath();
    ctx.moveTo(lx, 372);
    ctx.lineTo(lx, 388);
    ctx.stroke();
  }
}

const WINTER_DIFFS = [
  { id: 'nose', x: 0.517, y: 0.71, r: 24, label: 'The snowman lost its nose' },
  { id: 'window', x: 0.787, y: 0.529, r: 22, label: 'A window light went out' },
  { id: 'star', x: 0.867, y: 0.41, r: 18, label: 'The tree star is missing' },
  { id: 'bow', x: 0.342, y: 0.838, r: 22, label: 'A gift bow changed colour' },
  { id: 'antler', x: 0.8, y: 0.776, r: 26, label: 'A reindeer antler is missing' },
  { id: 'smoke', x: 0.233, y: 0.333, r: 26, label: 'The chimney smoke vanished' },
];

// ---------------------------------------------------------------------------
// Scene registry
// ---------------------------------------------------------------------------
export const SCENES = [
  { id: 'park', name: 'Sunny Park', tagline: 'A bright afternoon in the park', draw: drawPark, diffs: PARK_DIFFS },
  { id: 'beach', name: 'Beach Sunset', tagline: 'Golden hour by the sea', draw: drawBeach, diffs: BEACH_DIFFS },
  { id: 'kitchen', name: 'Cozy Kitchen', tagline: 'Tea time at home', draw: drawKitchen, diffs: KITCHEN_DIFFS },
  { id: 'space', name: 'Space Adventure', tagline: 'Drifting among the stars', draw: drawSpace, diffs: SPACE_DIFFS },
  { id: 'reef', name: 'Coral Reef', tagline: 'Down where the fishes play', draw: drawReef, diffs: REEF_DIFFS },
  { id: 'winter', name: 'Winter Village', tagline: 'Snowfall over the rooftops', draw: drawWinter, diffs: WINTER_DIFFS },
];

/** Draw one side of a level: `applied` is the set of difference ids switched on. */
export function drawScene(ctx, scene, applied) {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  scene.draw(ctx, applied);
  ctx.restore();
}

/** The right-hand panel shows every difference switched on. */
export function alteredSet(scene) {
  return new Set(scene.diffs.map((d) => d.id));
}
