# Scene 04 — Implémentation didactique

## Objectif pédagogique

Comparer l'impact des **draw calls** selon 3 stratégies de rendu :

- `meshes` : 1 triangle = 1 mesh,
- `oneMesh` : tous les triangles dans un seul mesh,
- `instancedMesh` : 1 triangle instancié N fois.

## Architecture

- `scene.js` démarre la scène avec `Scene04Camera`.
- `World` contient la couche UI (boutons, slider, stats).
- `DrawCallLab` construit/détruit les géométries selon le mode choisi.

## Génération des triangles

Le labo génère des triangles aléatoires :

- centre dans un cube de travail,
- orientation aléatoire (quaternion),
- couleur vertex aléatoire.

La taille est normalisée pour que la comparaison des modes reste visuelle et équitable.

## Les 3 stratégies

### `meshes`

Chaque triangle a sa `BufferGeometry` + `Mesh`.  
Très coûteux en draw calls, utile pour visualiser le pire cas CPU.

### `oneMesh`

On concatène toutes les positions/couleurs dans de grands buffers.  
Très peu de draw calls, bon benchmark de batching manuel.

### `instancedMesh`

On réutilise une seule géométrie triangle avec matrices et couleurs d'instance.  
Pattern clé pour répéter des objets similaires avec coût GPU réduit.

## Instrumentation de performance

`World` affiche :

- FPS moyen (fenêtre de temps courte),
- nombre de draw calls via `renderer.info.render.calls`,
- mode actif et nombre de triangles.

Cette instrumentation transforme la scène en mini-lab de profiling.

## Choix de conception

- UI HTML native plutôt que debug GUI pour simplifier l'usage,
- rebuild complet à chaque changement de mode/quantité (code clair et déterministe),
- disposal explicite des géométries pour éviter les fuites mémoire.

## À retenir

Scene 04 rend tangible une règle majeure en temps réel :

- réduire les draw calls est souvent plus important que "optimiser un shader" tôt dans le projet.
