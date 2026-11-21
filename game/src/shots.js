// The screenshot scenes behind ?shot=start|play|level|win. Each one stages a
// real world state (the same rules a player meets) and returns the screen to
// draw over it, so a frame is what the game really looks like and the same
// seed always gives the same frame.
import { SCREEN_GAME_DONE, SCREEN_LEVEL_DONE, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/** Mark a difference by its own centre, as a player tapping it would. */
function findDiff(world, index) {
  const diff = world.scene().diffs[index];
  return world.mark(diff.x, diff.y, 'left');
}

/** Pin sparkle birth times so staged shots render identically every time. */
function freezeParticles(world) {
  for (const p of world.state.particles) p.born = 0;
}

/**
 * Set `world` to the named scene and return the screen to draw plus any lens
 * override for the shot. Any other name is the title screen.
 */
export function stageShot(name, world) {
  if (name === 'play') {
    world.startLevel(0);
    findDiff(world, 0);
    findDiff(world, 1);
    world.state.timeLeft = 64;
    world.state.score = 225;
    freezeParticles(world);
    return {
      screen: SCREEN_PLAY,
      ui: { lensOn: true, lens: { x: 0.42, y: 0.55, visible: true } },
    };
  }
  if (name === 'level') {
    world.startLevel(0);
    world.state.timeLeft = 37;
    for (let i = 0; i < 6; i += 1) findDiff(world, i);
    freezeParticles(world);
    return { screen: SCREEN_LEVEL_DONE, ui: null };
  }
  if (name === 'win') {
    world.startLevel(5);
    for (let i = 0; i < 6; i += 1) findDiff(world, i);
    world.state.stars = { 0: 3, 1: 3, 2: 2, 3: 3, 4: 2, 5: 3 };
    world.state.totalScore = 3250;
    world.state.unlocked = 6;
    freezeParticles(world);
    return { screen: SCREEN_GAME_DONE, ui: null };
  }
  world.startLevel(0);
  return { screen: SCREEN_TITLE, ui: null };
}
