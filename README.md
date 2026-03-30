# Discover Three.js

Site didactique avec **homepage** et **scènes** (niveaux) en [Three.js](https://threejs.org/). L’architecture suit la synthèse *Code structuring for bigger projects* (three.js journey) : singleton **`Experience`**, **`Camera`** / **`Renderer`** / **`World`**, **`sources.js`** + **`Resources`**, **`Utils/`** (`EventEmitter`, `Sizes`, `Time`, `Debug`), et **`World`** découpé en composants (`Floor`, `Subjects`, `Environment`, panneaux debug).

## Prérequis

- [Node.js](https://nodejs.org/) 18+
- [Git LFS](https://git-lfs.com/) — requis pour cloner les assets sous `public/` (textures, `.glb`, `.bin`, `.fbx`, etc.). Après installation : `git lfs install` une fois sur la machine.

### Cloner le dépôt

```bash
git lfs install
git clone <url-du-depot>
cd discover-threejs
git lfs pull   # si besoin, pour récupérer les pointeurs LFS
```

Sans Git LFS, les gros fichiers apparaîtront comme de petits fichiers texte (pointeurs) et le projet ne fonctionnera pas correctement.

## Scripts

```bash
npm install
npm run dev      # dev server (Vite)
npm run build    # sortie dans dist/
npm run preview  # prévisualiser la build
```

## Structure

- `index.html` — accueil et liens vers les scènes
- `scene01.html` — scène 1 : `src/scenes/scene01/scene.js` instancie `Experience(canvas, World)` ; le monde est dans `src/scenes/scene01/World/`
- `scene02.html` — scène 2 : `Experience(canvas, World, { camerasFactory })` ; multi-caméras dans `src/scenes/scene02/World/Scene02Cameras.js`
- `src/Experience/` — cœur WebGL : `Experience.js`, `Camera.js`, `Renderer.js`, `sources.js`, `Utils/` (pas de `World` ici : chaque scène fournit son propre `World`)
- **lil-gui** : actif uniquement si l’URL contient **`#debug`** (comme dans le cours). Matcaps : fichiers `public/textures/matcap/matcap-1.png` … `matcap-4.png` (voir `Experience/sources.js`).
- **Scène 2 — glTF** : chemins dans `public/textures/models/` (voir `Experience/sources.js`) — bouteille, violon, roue à eau, etc. Bouton **GLTF Viewer** dans le panneau `#debug` → [glTF Viewer](https://gltf-viewer.donmccurdy.com/). Les gros binaires sont suivis avec **Git LFS** (voir `.gitattributes`).

Arborescence cible (rappel cours) :

```text
src/Experience/
├── Experience.js
├── Camera.js
├── Renderer.js
├── sources.js
└── Utils/
    ├── EventEmitter.js
    ├── Sizes.js
    ├── Time.js
    ├── Resources.js
    ├── Debug.js
    └── createCheckerboardTexture.js

src/scenes/scene01/
├── scene.js
└── World/
    ├── World.js
    ├── Environment.js
    ├── Floor.js
    ├── Subjects.js
    ├── Materials.js
    └── WorldDebug.js

src/scenes/scene02/
├── scene.js
└── World/
    ├── World.js
    ├── Floor.js
    ├── Subjects.js
    ├── Ball.js
    ├── Environment.js
    ├── Scene02Cameras.js
    └── WorldDebug.js
```

## GitHub & Git LFS

Les règles LFS sont dans `.gitattributes` (préfixe `public/**/` : `.glb`, `.bin`, textures image, `.fbx`, etc.). Les fichiers `.gltf` et `.txt` (licences) restent en Git normal.

Premier envoi :

```bash
git lfs install
git add .
git commit -m "Initial commit"
git remote add origin <url>
git push -u origin main
```

Sur GitHub, l’onglet du dépôt indique la présence de contenu LFS ; les [quotas LFS](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage) s’appliquent au-delà du volume gratuit.

## Déploiement (GitHub Pages)

Pour un dépôt `https://<user>.github.io/<repo>/`, définir dans `vite.config.js` :

```js
export default {
  base: '/<repo>/',
  // ...
}
```

Puis build et publier le contenu de `dist/` sur la branche `gh-pages` (ou action GitHub Pages).

## Licence

Projet d’apprentissage — adaptez librement.
