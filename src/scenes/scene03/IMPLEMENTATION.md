# Scene 03 — Implémentation didactique

## Objectif pédagogique

Introduire un shader custom GLSL appliqué à une géométrie 3D :

- uniforms pilotées depuis JavaScript,
- liaison avec les lumières de la scène,
- switch de géométrie en temps réel.

## Architecture

- `scene.js` utilise une caméra dédiée (`Scene03Camera`).
- `World` instancie `Environment` + `SphereSubject`.
- `SphereSubject` porte la logique shader et les contrôles debug.

## Shader material

Le matériau est un `THREE.ShaderMaterial` avec uniforms :

- couleur de base,
- couleur ambiante,
- couleur de lumière,
- direction de lumière,
- interrupteur `uLightOn`.

Le vertex shader gère la projection standard, le fragment shader produit le rendu final.

## Synchronisation lumière ↔ shader

À chaque frame, `SphereSubject.update()` recalcule `uLightDirection` à partir de :

- position de la lumière directionnelle,
- position de sa cible.

Pourquoi : le shader ne "lit" pas automatiquement les lights Three.js quand on est en `ShaderMaterial` custom.

## Changement de géométrie

Le sujet propose plusieurs géométries (`sphere`, `cube`, `octahedron`, `torusKnot`).  
Lors d'un switch :

1. dispose de l'ancienne géométrie,
2. crée la nouvelle,
3. recalibre l'échelle pour conserver une taille visuelle cohérente.

Cette normalisation facilite les comparaisons de rendu.

## Debug didactique

Le dossier debug expose :

- type de géométrie,
- activation de la lumière dans le shader,
- couleurs (base et lumière).

L'élève peut donc relier directement code GLSL et impact visuel.

## À retenir

Scene 03 montre le pont entre Three.js et GLSL :

1. Three.js gère scène/caméra/matrice,
2. le shader gère l'apparence,
3. JavaScript alimente les uniforms en continu.
