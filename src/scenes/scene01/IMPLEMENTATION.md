# Scene 01 — Implémentation didactique

## Objectif pédagogique

Cette scène introduit les briques de base d'une scène Three.js structurée :

- organisation `Experience / World / Subjects / Environment`,
- matériaux standard et matcap,
- animation simple,
- GUI de debug conditionnée à `#debug`.

## Architecture

- `scene.js` crée `Experience(canvas, World)`.
- `World/World.js` orchestre la création asynchrone après `resources.ready`.
- `Floor`, `Subjects`, `Environment` ont chacun une responsabilité unique.
- `WorldDebug` expose les réglages d'éclairage/matériaux.

Cette séparation évite d'avoir une classe géante et rend chaque composant testable.

## Chargement et cycle de vie

Le `World` attend `this.resources.on('ready', ...)` avant d'instancier le contenu visuel.  
Pourquoi : garantir que textures/modèles sont disponibles avant usage.

Le `update()` du monde appelle uniquement ce qui doit évoluer par frame :

- animation des sujets,
- éventuelle animation des lumières,
- mise à jour debug si nécessaire.

## Sol (`Floor`)

Le sol sert de repère spatial (horizon visuel et réception des ombres).  
Un damier procédural évite une dépendance à une texture externe.

## Sujets (`Subjects`)

Les objets de démo (mesh de primitives et/ou modèles) montrent :

- géométries différentes,
- matériaux différents,
- gestion `castShadow` / `receiveShadow`.

Le code stocke des entrées (`id`, `mesh`) pour pouvoir relier d'autres systèmes (ex: lumière orbitale).

## Environnement (`Environment`)

La scène combine généralement :

- lumière ambiante (base diffuse),
- directionnelle (ombre principale),
- point light dynamique.

Le point clé didactique : chaque type de lumière remplit un rôle différent dans la lisibilité.

## Debug (`WorldDebug`)

Actif uniquement avec `#debug` :

- contrôle intensité/couleur des lumières,
- réglages matériaux si exposés.

On garde le code debug dans une classe dédiée pour ne pas polluer la logique runtime.

## À retenir

Scene 01 pose le socle du projet :

1. architecture modulaire,
2. initialisation asynchrone propre,
3. séparation nette entre rendu, monde et debug.
