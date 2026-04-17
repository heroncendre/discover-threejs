# Scene 02 — Implémentation didactique

## Objectif pédagogique

Montrer comment passer d'une scène simple à une scène "système" :

- plusieurs caméras (perspective + orthographique),
- navigation par raycaster,
- animation sur courbe (`SplineCurve`),
- chargement glTF avec feedback utilisateur.

## Pipeline global

- `scene.js` instancie `Experience` avec `camerasFactory`.
- `Scene02Cameras` remplace la caméra par défaut.
- `World` crée `Floor`, `Subjects`, `Ball`, `Environment` après `resources.ready`.
- `LoadingScreen` affiche la progression de chargement.

## Multi-caméras (`Scene02Cameras`)

La classe contient 3 caméras :

- vue d'ensemble orbit,
- caméra proche de la bille,
- vue orthographique de dessus.

Un `activeIndex` expose une API simple (`camera.instance`) compatible avec `Renderer`.

## Courbe et bille

`Floor` calcule une courbe fermée échantillonnée dans l'espace XZ.  
`Ball` avance avec un paramètre `u` dans `[0,1)` :

- position = interpolation entre points de courbe,
- vitesse exprimée en "tours par seconde".

Cette approche est plus robuste qu'une animation basée sur indices entiers.

## Sujets glTF et fallback

`Subjects` tente d'abord de charger les modèles glTF.  
Si absent, fallback sur primitives Three.js.

Avantage didactique :

- la scène continue de fonctionner même si un asset manque,
- l'élève peut comprendre la logique sans être bloqué par les ressources.

## Raycaster et cible de regard

Un clic raycast les objets "pickables", et stocke une cible (`lookAtTarget`).  
Les caméras 1 et 2 orientent ensuite leur regard vers cette cible.

## Environnement lumineux

Combinaison d'ambient + directional + point orbitale :

- shadows activées sur directionnelle,
- orbite de la point light autour du centre des sujets.

## Debug

`WorldDebug` permet :

- switch caméra active,
- réglage intensités lumières,
- accès rapide au glTF viewer externe.

## À retenir

Scene 02 illustre une architecture "interactive" :

1. caméra comme module interchangeable,
2. monde piloté par événements de chargement,
3. interactions utilisateur découplées du rendu.
