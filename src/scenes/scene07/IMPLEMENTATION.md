# Scene 07 — Implémentation didactique

## Objectif pédagogique

Prolonger la scène 06 avec une logique de **transition de modes** et de **densification de points** :

- cycle triangles → lines → points,
- interpolation douce entre modes,
- pseudo-tessellation pour enrichir le nuage de points.

## Architecture

La scène est autonome (hors `Experience`) comme un laboratoire visuel.  
Elle reprend le drag & drop GLB et ajoute un système d'animation de modes.

## Rendus alternatifs

Après chargement d'un modèle :

- un groupe `modelRoot` (triangles),
- un groupe `lineRoot` (wireframe),
- un groupe `pointRoot` (nuage de points)

sont construits et gardés en mémoire.

Le système modifie ensuite leurs opacités plutôt que recréer tout en continu.

## Cycle de modes

`getModeWeights(time)` calcule des poids `[triangles, lines, points]` :

- phase stable sur un mode,
- phase de transition (`smoothstep`) vers le suivant.

Ce pattern est utile pour enseigner les transitions temporelles sans "cuts" visuels.

## Densification de points

`createDensifiedPointGeometry()` échantillonne les triangles avec coordonnées barycentriques.

Pourquoi :

- un simple point cloud "sommets originaux" est souvent trop pauvre,
- la densification rend les formes lisibles en mode points.

Le code limite le nombre de points avec un `stride` pour éviter l'explosion de coût GPU.

## Shader points

Le shader de points gère :

- taille écran-adaptative selon profondeur,
- opacité pilotée pour les transitions,
- couleur et blending additif.

Optionnellement, un pulse temporel modifie la taille des points.

## Debug

Le panneau debug expose :

- mode fixe ou cycle,
- durées (mode / transition),
- tessellation des points,
- paramètres de lumière et taille de points.

## À retenir

Scene 07 est un excellent cas d'étude pour :

1. orchestrer plusieurs représentations d'un même objet,
2. interpoler des états de rendu dans le temps,
3. équilibrer qualité visuelle et budget performance.
