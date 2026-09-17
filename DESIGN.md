# Cinematic portfolio — director’s cut

Original eclipse artwork generated with the built-in image-generation tool. Production asset: `img/cinematic/eclipse.jpg` (approximately 310 KB). Product artwork comes from the existing app assets and the official FamilyBrief and PocketPOS websites.

## Final artwork prompt

Use case: stylized-concept. Asset type: cinematic website hero background, ultrawide landscape 16:9. Create a breathtaking premium science-fiction film still of a monumental dark eclipsed celestial sphere, centered horizontally and slightly above the middle, encircled by an incredibly thin brilliant molten copper and ivory corona, with a sweeping gravitational accretion disk of fine luminous copper filaments arcing horizontally across the frame and bending upward behind the sphere. The black circle occupies 45 percent of the frame width. Almost black background, deep obsidian void, delicate volumetric smoke and sparse tiny distant stars. Astronomically monumental, physically rich, elegant, highly detailed IMAX VFX cinematography, sophisticated warm copper/ivory highlights against absolute charcoal black. Broad composition with deep dark quiet space across lower third for large cream website typography. Extremely sharp fine light filaments, subtle lens bloom, tactile cosmic dust, dramatic contrast. This is an art image only, no website UI, no typography, no letters, no labels, no logos, no watermark. Avoid colorful nebula, purple, blue, cartoon, ordinary planet texture. Output one polished landscape artwork.

## Interaction direction

Full-screen opening with a slow camera move, a moving corona, particle depth, and pointer response. Native scrolling drives gentle background and product parallax. Motion can be disabled and respects the system reduced-motion preference. The work collection begins with six projects and expands on request; category filters retain every matching project. Career history uses native keyboard-accessible disclosures.

## Local preview

Run `python3 -m http.server 4321` and open `http://localhost:4321/`. No build step or new runtime dependencies. All work remains uncommitted for review.

## Portfolio connection

The opening now pairs the eclipse with actual PocketPOS and AS Rock ID screens and an explicit iOS engineering headline. On desktop, the AS Rock ID artwork travels into its showcase during native scrolling. On phones and with motion disabled, both screen placements remain static. The studio follows the opening directly; the client credits and introduction follow the complete product collection.

## Interaction polish

The featured scenes include a compact purpose / engineering / platform strip. Fine-pointer movement adds restrained lighting and product depth; reduced motion and the motion toggle disable it. A compact chapter dock appears after the opening and marks the current section. The closing typographic signature anchors the portfolio to Amir’s identity. Native scrolling, normal cursors, existing app links, and keyboard navigation are preserved.

## Motion performance pass

The screen handoff uses a fixed 960-pixel image layer with translation and uniform scaling, instead of animating width and height. Layout is measured on resize, font/image load, and content-size changes. Scroll and pointer updates share a single on-demand animation frame scheduler with time-based pointer easing. Dust is painted once and moved as a layer. Animated blur and backdrop blur were removed from moving surfaces; offscreen and background-page animations pause.
