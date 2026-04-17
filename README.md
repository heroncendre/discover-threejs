# Discover Three.js

Site didactique composé de 9 scènes progressives en [Three.js](https://threejs.org/) (caméras, shaders, collisions, post-process, shadow maps, etc.).

L’architecture principale suit le pattern `Experience` :

- singleton `Experience`,
- séparation `Camera` / `Renderer` / `World`,
- `Resources` + `sources.js`,
- `Utils` (`Sizes`, `Time`, `EventEmitter`, `Debug`).

Chaque scène possède son propre dossier et désormais un document pédagogique `IMPLEMENTATION.md`.

## Prérequis

- [Node.js](https://nodejs.org/) 18+
- [Git LFS](https://git-lfs.com/) (requis pour les assets dans `public/`)

### Cloner le dépôt

```bash
git lfs install
git clone <url-du-depot>
cd discover-threejs
git lfs pull
```

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Scènes (aperçu + documentation)

- **Scène 01 — Matériaux & lumières**  
  Sol, sujets, environnement lumineux, première approche `World` modulaire.  
  [En savoir plus](./src/scenes/scene01/IMPLEMENTATION.md)

- **Scène 02 — Multi-caméras & spline**  
  3 caméras, raycaster de sélection, bille animée sur courbe fermée, chargement glTF.  
  [En savoir plus](./src/scenes/scene02/IMPLEMENTATION.md)

- **Scène 03 — Shader custom**  
  `ShaderMaterial` GLSL, uniforms pilotées, changement de géométrie en temps réel.  
  [En savoir plus](./src/scenes/scene03/IMPLEMENTATION.md)

- **Scène 04 — Draw calls lab**  
  Comparaison `meshes` vs `one mesh` vs `instanced mesh`, instrumentation FPS et render calls.  
  [En savoir plus](./src/scenes/scene04/IMPLEMENTATION.md)

- **Scène 05 — Labyrinthe POV**  
  Contrôleur FPS, collisions grille/cercle, post-process jour/nuit/IR, mini-map HUD.  
  [En savoir plus](./src/scenes/scene05/IMPLEMENTATION.md)

- **Scène 06 — GLB loader & node tree**  
  Drag-and-drop GLB, inspection hiérarchie, pulsation de nœuds, modes triangles/lines/points.  
  [En savoir plus](./src/scenes/scene06/IMPLEMENTATION.md)

- **Scène 07 — Points & tessellation**  
  Transition animée entre modes de rendu, densification de nuage de points, contrôle temporal.  
  [En savoir plus](./src/scenes/scene07/IMPLEMENTATION.md)

- **Scène 08 — Shadow maps**  
  Démonstration didactique des ombres directionnelles, frustum d’ombre, type de filtre, map size POT.  
  [En savoir plus](./src/scenes/scene08/IMPLEMENTATION.md)

- **Scène 09 — Terrain procédural FPS**  
  Terrain continu, immeubles procéduraux, collisions `Octree + Capsule`, mini-map HUD.  
  [En savoir plus](./src/scenes/scene09/IMPLEMENTATION.md)

## Structure (raccourci)

- `index.html` : navigation entre scènes
- `scene01.html` … `scene09.html` : pages d’entrée
- `src/Experience/` : moteur commun
- `src/scenes/sceneXX/` : logique spécifique de chaque niveau

## GitHub & Git LFS

Les règles LFS sont définies dans `.gitattributes` pour les assets lourds (`.glb`, `.bin`, textures, `.fbx`, etc.).

```bash
git lfs install
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Déploiement (GitHub Pages)

Pour un dépôt `https://<user>.github.io/<repo>/`, définir `base` dans `vite.config.js` :

```js
export default {
  base: '/<repo>/',
}
```

Puis publier `dist/` (branche `gh-pages` ou workflow GitHub Pages).

## Assets et licences

### Assets référencés dans `sources.js`

- **Small bottle** (Sketchfab)  
  Source : [small-bottle-761e522abb934b0a98063a9851728180](https://sketchfab.com/3d-models/small-bottle-761e522abb934b0a98063a9851728180)  
  Licence locale : `public/models/bottle/license.txt` (Sketchfab Standard)

- **Classic acoustic violin** (Sketchfab)  
  Source : [classic-acoustic-violin-48ee34ec0f4842dfae25414f6f25a62d](https://sketchfab.com/3d-models/classic-acoustic-violin-48ee34ec0f4842dfae25414f6f25a62d)  
  Note : pas de fichier de licence dédié dans le repo ; vérifier la licence sur la page source.

- **Water wheel** (Sketchfab)  
  Source : [water-wheel-da4e000e36f1484aa1fbf9f042e82401](https://sketchfab.com/3d-models/water-wheel-da4e000e36f1484aa1fbf9f042e82401)  
  Licence locale : `public/models/water_wheel/license.txt` (CC-BY-4.0, crédit auteur requis)

### Textures matcap

- Fichiers : `public/textures/matcap/matcap-1.png` à `matcap-4.png`
- Vérifier les droits d’usage selon la source d’origine des textures si redistribution publique.

## Licence du projet

Projet d’apprentissage — adaptez librement.
