# Scene 05 — Implémentation didactique

## Objectif pédagogique

Construire une scène "jeu" en vue FPS avec :

- contrôleur WASD + souris (pointer lock),
- collisions contre murs,
- modes visuels (jour/nuit/IR),
- mini-map HUD.

## Architecture

- `scene.js` démarre `Experience` avec `Scene05Camera`.
- `World` assemble `Maze`, `Environment`, `PlayerController`, `VisualModes`.
- `WorldDebug` expose les réglages de lumières et mode visuel.

## Labyrinthe (`Maze`)

La map est un tableau de chaînes (`LAYOUT`) :

- `1` = mur,
- `0` = vide,
- `S` = spawn.

Cette structure est idéale pour une topologie grille : simple, lisible, O(1) en accès cellule.

Le mesh des murs est construit cellule par cellule depuis ce layout.

## Collision joueur ↔ murs

Le joueur est un cercle en XZ (`radius`).  
`collidesCircleXZ(position, radius)` :

1. convertit la bbox du cercle en plage de cellules,
2. ne teste que ces cellules locales,
3. calcule distance cercle-rectangle (mur) via point le plus proche.

On évite donc un balayage complet de la map à chaque frame.

Dans `PlayerController`, le déplacement est résolu axe par axe (X puis Z), ce qui produit un glissement naturel le long des murs.

## Contrôleur FPS

Le contrôleur gère :

- yaw/pitch souris,
- vecteurs forward/right depuis yaw,
- déplacement normalisé WASD,
- mise à jour caméra avec hauteur des yeux.

## Modes visuels (`VisualModes`)

Trois modes :

- `day`,
- `night` (vignette),
- `ir` (teinte verte + scanlines).

Implementation via `EffectComposer` + `RenderPass` + `ShaderPass`.

## HUD mini-map

Le HUD Canvas 2D affiche :

- grille mur/vide,
- position joueur,
- feedback colorimétrique de proximité d'un mur.

## À retenir

Scene 05 introduit les bases d'un gameplay 3D :

1. input FPS,
2. collision spatiale efficace sur grille,
3. post-process et HUD séparés du cœur simulation.
