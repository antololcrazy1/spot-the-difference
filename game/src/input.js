// Difference Detective — pointer and keyboard input on the play canvas.
// A tap is a short press that barely moves; a drag moves the magnifier lens
// instead of marking. Arrow keys move an on-screen crosshair, Enter marks.
export const KEY_HINT = 1;
export const KEY_LENS = 2;
export const KEY_PAUSE = 4;
export const KEY_MARK = 8;

const TAP_MAX_MOVE = 12;
const TAP_MAX_MS = 450;

export function createInput(canvas) {
  const taps = [];
  let keys = 0;
  const crosshair = { x: 0.5, y: 0.5, active: false };
  let lens = { x: 0.5, y: 0.5, visible: false };
  let down = null;

  function toFraction(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const at = toFraction(event);
    down = { x: at.x, y: at.y, time: performance.now(), id: event.pointerId };
    lens.x = at.x;
    lens.y = at.y;
    lens.visible = true;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Some browsers refuse capture on mouse: the tap still works.
    }
  });

  canvas.addEventListener('pointermove', (event) => {
    const at = toFraction(event);
    lens.x = at.x;
    lens.y = at.y;
    lens.visible = true;
    if (down && event.pointerType === 'mouse') {
      crosshair.x = at.x;
      crosshair.y = at.y;
      crosshair.active = true;
    }
    if (down && Math.hypot((at.x - down.x) * 1000, (at.y - down.y) * 1000) > TAP_MAX_MOVE) {
      down.moved = true;
    }
  });

  canvas.addEventListener('pointerup', (event) => {
    if (!down) return;
    const at = toFraction(event);
    const moved = Math.hypot((at.x - down.x) * 1000, (at.y - down.y) * 1000);
    const held = performance.now() - down.time;
    if (!down.moved && moved <= TAP_MAX_MOVE && held <= TAP_MAX_MS) {
      taps.push({ x: at.x, y: at.y });
    }
    down = null;
  });

  canvas.addEventListener('pointercancel', () => {
    down = null;
  });

  canvas.addEventListener('pointerleave', () => {
    lens.visible = false;
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const step = event.shiftKey ? 0.06 : 0.025;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      crosshair.active = true;
      if (event.key === 'ArrowLeft') crosshair.x = Math.max(0.02, crosshair.x - step);
      if (event.key === 'ArrowRight') crosshair.x = Math.min(0.98, crosshair.x + step);
      if (event.key === 'ArrowUp') crosshair.y = Math.max(0.02, crosshair.y - step);
      if (event.key === 'ArrowDown') crosshair.y = Math.min(0.98, crosshair.y + step);
      lens.x = crosshair.x;
      lens.y = crosshair.y;
      lens.visible = true;
      event.preventDefault();
    } else if (event.key === 'Enter' || event.key === ' ') {
      keys |= KEY_MARK;
      event.preventDefault();
    } else if (event.key === 'h' || event.key === 'H') {
      keys |= KEY_HINT;
    } else if (event.key === 'l' || event.key === 'L') {
      keys |= KEY_LENS;
    } else if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') {
      keys |= KEY_PAUSE;
    }
  });

  return {
    taps,
    crosshair,
    lens,
    takeKeys() {
      const taken = keys;
      keys = 0;
      return taken;
    },
    markAtCrosshair() {
      return { x: crosshair.x, y: crosshair.y };
    },
  };
}
