# 🦖 Dino Dash

A kid-friendly maths race: solve addition problems by popping answer bubbles before the dino catches you.

## How to play

1. You start **4 steps** ahead of the dino on a 12-step track.
2. Each round shows an addition question (`1–10 + 1–10`) with **4 bubbles** (one correct, three distractors).
3. **Correct answer** → you move forward 1 step (or **2** on a turbo streak of 3+).
4. **Wrong answer** → that bubble is disabled and the dino stomps one step closer. Keep trying the other bubbles.
5. Reach the finish first to win. If the dino catches up, race again!

**Desktop tip:** press keys `1`–`4` to pick bubbles.

## Run locally

This is a static site (no build step), but Material Web components load from a CDN via ES modules, so open it through a local server rather than `file://`.

```bash
# from the project folder
python3 -m http.server 8766
```

Then visit [http://127.0.0.1:8766/](http://127.0.0.1:8766/).

A network connection is required the first time so the browser can fetch fonts and `@material/web` from the CDN.

## Project layout

| File | Role |
|------|------|
| `index.html` | Page structure: track, quiz, end dialog |
| `styles.css` | Material 3 green theme, track, bubbles, responsive layout |
| `script.js` | Game state, questions, scoring, win/lose |

## Tech notes

- **Vanilla HTML / CSS / JS** — no bundler or framework
- **Material Web** (`md-filled-button`, `md-icon`) for the “Race again” dialog
- **Material 3 green palette** with light/dark via `prefers-color-scheme`
- **Accessibility:** live feedback, labelled controls, keyboard shortcuts, `prefers-reduced-motion`
- **Mobile-first layout:** bubbles sit in the thumb zone; desktop widens the track and shows key hints

## Game constants (in `script.js`)

| Constant | Value | Meaning |
|----------|-------|---------|
| `FINISH` | 12 | Steps to the finish line |
| `PLAYER_START` | 4 | Your head start |
| `MAX_GAP` | 6 | Max lead before the dino keeps pace |
| `STREAK_FOR_BOOST` | 3 | Correct answers in a row for turbo (+2 steps) |
