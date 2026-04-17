# Scene 08 — Implémentation didactique

## Objectif pédagogique

Expliquer concrètement les **shadow maps** :

- comment la lumière directionnelle projette les ombres,
- rôle du frustum de la caméra d'ombre,
- impact du type de filtre et de la taille de texture.

## Base de scène

La scène 08 reprend la géométrie globale de la scène 2 (sol, sujets, bille), mais la pédagogie est centrée sur l'ombre.

Points clés :

- `DirectionalLightHelper` visible,
- `CameraHelper` sur `directionalLight.shadow.camera`,
- `pointLight.castShadow = false` pour isoler le comportement de la shadow map directionnelle.

## Debug principal (`WorldDebug`)

Le debug est organisé en dossiers :

1. **Ombres · renderer**
   - choix du type de shadow map (`Basic`, `PCF`, `PCF soft`, `VSM`).
2. **Caméra d'ombre (orthographique)**
   - `left/right/top/bottom`,
   - `near/far`,
   - mode "lier les 4 côtés".
3. **Texture d'ombre**
   - taille POT de `16` à `4096`.

## Mode "lier les 4 côtés"

Quand activé :

- les 4 sliders pilotent la même grandeur `extent`,
- la caméra d'ombre devient un carré centré (`left=-e`, `right=e`, `top=e`, `bottom=-e`),
- l'affichage des 4 sliders est synchronisé (`updateDisplay`) pour éviter une UI incohérente.

Cette partie aide à comprendre le compromis :

- frustum trop petit => ombres coupées,
- frustum trop grand => perte de précision.

## Changement de taille de map

Modifier `mapSize` :

- met à jour `light.shadow.mapSize`,
- dispose l'ancienne map pour forcer une reconstruction propre.

On évite ainsi de garder une texture d'ombre obsolète en mémoire.

## À retenir

Scene 08 transforme la shadow map en objet pédagogique manipulable :

1. visualisation du volume de capture,
2. contrôle qualité/perf (type + résolution),
3. compréhension du lien entre frustum et qualité des ombres.
