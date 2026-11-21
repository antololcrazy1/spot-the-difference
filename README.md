# Difference Detective — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/antololcrazy1/spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/antololcrazy1/spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

A make.fun entry for the bounty **best-spot-the-difference-game-20261121-0451**:
make the best spot-the-difference game. Two pictures, six tiny differences,
one sharp eye.

## The game

**Difference Detective** is a polished spot-the-difference game that runs
entirely offline in a desktop or mobile browser — no libraries, no network,
plain ES modules on a canvas.

- **6 hand-drawn scenes**, each a pair of smooth, colourful vector pictures
  (no pixel art): Sunny Park, Beach Sunset, Cozy Kitchen, Space Adventure,
  Coral Reef and Winter Village. Every scene hides **6 differences**.
- **Tap or click** a difference on either picture to mark it with a green
  ring. Wrong taps cost 25 points and 3 seconds; finding several in a row
  builds a combo bonus.
- **Timer and score**: 120 / 90 / 60 seconds per scene (Relaxed / Classic /
  Rush), leftover time pays a bonus, and each scene awards 1–3 stars.
- **Hints**: 3 per scene — a pulsing ring shows where to look.
- **Magnifier lens**: a 2× lens follows your pointer so tiny details are easy
  to check. **Keyboard**: arrows move a crosshair, Enter marks, H hint,
  L lens, P pause.
- **Sound**: soft WebAudio dings and buzzes, mutable from the HUD.
- **Progress**: scenes unlock in order, stars and the best total are saved
  in the browser.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

## Screenshots

`screenshots/` holds four in-game frames, rendered deterministically with
`?shot=start|play|level|win&seed=1` (see `shots.json`).

## Entry

- Competition: https://make.fun/bounty/best-spot-the-difference-game-20261121-0451
- Entrant: @antolol on make.fun, repo owner antololcrazy1 on GitHub
- `main.ts` copies `game/` and `screenshots/` to the output directory and
  writes `dossier.json` (Node 22, standard library only).
