# Portfolio — "One Home Screen"

The portfolio is a Home Screen. The hero is a CSS-built iPhone whose icons are the real As Apps products; tapping one opens an App Store-style page inside the phone. Navigation is a Dynamic Island that names the current chapter, shows scroll progress, and expands into the menu.

## Files

- `index.html` — all content.
- `css/site.css` — styles. Tokens at the top (`--ink`, `--paper`, `--swift`, fonts).
- `js/site.js` — interactions, no dependencies. The `APPS` object at the top holds what the phone shows for each product.

## Design decisions

- **Palette:** ink `#0a0a0c`, paper `#f2f0ea`, one accent: Swift orange `#f05138`. Featured products get their own colour worlds.
- **Type:** Bricolage Grotesque (condensed, heavy) for display, Geist for text, Geist Mono for labels.
- **Rhythm:** dark hero and studio, light client-work index, dark specs and experience, orange contact.
- **Motion:** phone unlocks on load, icons zoom open, pointer tilt, stacking product cards, word-by-word statement, cursor preview on client work. Everything respects `prefers-reduced-motion`; the page works without JavaScript.

## Editing

- Add a studio app: icon in `img/asapps/`, a button in `.ios-grid`, an entry in `APPS`, a card in `.catalog__grid`.
- Add client work: one `<li class="job">` in `#work` with `data-cat` and `data-preview`; update the filter counts.

## Local preview

`python3 -m http.server 4321`, then open `http://localhost:4321/`.
