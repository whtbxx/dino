# Dino Games

Two kid-friendly maths games in one static site.

| Game | Path | Idea |
|------|------|------|
| **Dino Dash** | [`dash/`](dash/) | Race a chasing dino by popping answer bubbles |
| **Dino Battles X** | [`battles-x/`](battles-x/) | Hatch an egg, then fight with maths hits in an arena |

Open the root [`index.html`](index.html) to choose a game.

## Run locally

Static HTML/CSS/JS (no build), but Material Web loads from a CDN, so use a local server:

```bash
python3 -m http.server 8766
```

Then visit [http://127.0.0.1:8766/](http://127.0.0.1:8766/).

A network connection is needed the first time for fonts and `@material/web`.

## Layout

```
index.html      # game chooser
styles.css      # chooser styles
dash/           # Dino Dash race
battles-x/      # Dino Battles X fight
```

Each game folder has its own `index.html`, `styles.css`, and `script.js`.
