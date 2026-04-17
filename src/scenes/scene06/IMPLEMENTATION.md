# Scene 06 — Implémentation didactique

## Objectif pédagogique

Explorer un modèle GLB en mode "outil" :

- drag & drop de fichier local,
- inspection de l'arbre de nœuds,
- surbrillance du nœud sélectionné,
- comparaison de rendus triangles / wireframe / points.

## Particularité architecture

Contrairement aux scènes 01–05, la scène 06 n'utilise pas `Experience`.  
Elle est volontairement autonome pour montrer une approche "viewer" :

- renderer local,
- caméra locale,
- boucle `requestAnimationFrame` locale,
- UI HTML split (vue 3D à gauche, arbre à droite).

## Chargement modèle

`GLTFLoader` charge un fichier GLB déposé.  
Après chargement :

1. purge du modèle précédent (dispose géométrie),
2. centrage et normalisation d'échelle,
3. activation des ombres,
4. construction des rendus alternatifs et du tree view.

## Arbre de nœuds (Node Tree)

Le panneau droit liste récursivement tous les nœuds du modèle.  
Cliquer un nœud déclenche une pulsation emissive sur un mesh associé.

Le but est didactique : relier hiérarchie de scène et résultat visuel.

## Modes de rendu

- `triangles` : rendu mesh normal,
- `lines` : `WireframeGeometry`,
- `points` : `Points` + `ShaderMaterial` custom.

Le mode points applique un léger déplacement pseudo-noise pour rendre la structure plus lisible.

## Debug GUI

Avec `#debug` :

- autorotation, vitesse,
- roughness, normal scale,
- paramètres du mode points (taille, bruit, blending).

## Choix de conception

- séparation claire entre logique de chargement et logique de visualisation,
- nettoyage mémoire explicite entre deux fichiers,
- contrôles de rendu orientés "apprentissage" plus que "production".

## À retenir

Scene 06 sert de mini "Model Inspector" didactique pour comprendre :

1. pipeline de chargement GLB,
2. structure de scène Three.js,
3. impact visuel des différents types de primitives de rendu.
