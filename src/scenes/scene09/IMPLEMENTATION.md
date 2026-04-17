# Scene 09 — Implémentation didactique

Ce document explique la scène 09 de manière pédagogique : pourquoi chaque classe existe, quels algorithmes sont utilisés, et quels compromis ont été faits.

---

## 1) Objectif de la scène

La scène 09 démontre un cas "jeu 3D" en espace continu :

- un **terrain procédural** (pas de grille fixe de type labyrinthe),
- des **immeubles** (boîtes de tailles variables),
- un **contrôleur FPS** (`WASD + souris + saut`),
- des **collisions robustes** via **Octree + capsule**,
- une **mini-map HUD** qui affiche position et orientation.

L’idée est de montrer une architecture claire et modulaire, proche d’un prototype de gameplay.

---

## 2) Structure des fichiers

- `scene.js`
  - Point d’entrée de la scène.
  - Instancie `Experience` avec `World` et une caméra dédiée `Scene09Camera`.
  - Gère le message d’aide temporaire.

- `World/Scene09Camera.js`
  - Caméra perspective typée FPS.
  - Gère uniquement création, resize, destruction.

- `World/ProceduralTerrain.js`
  - Génère une géométrie plane subdivisée.
  - Déplace les sommets en Y avec une fonction de hauteur.
  - Colorise les sommets en fonction de la hauteur.

- `World/CityBlocks.js`
  - Place des box (immeubles) aléatoirement dans un rayon.
  - Adapte leur base à la hauteur locale du terrain.

- `World/FpsController.js`
  - Gère entrées clavier/souris.
  - Simule mouvement, gravité, saut.
  - Résout collisions avec `Octree` via une **capsule**.

- `World/World.js`
  - Orchestration globale : lumières, terrain, ville, octree, contrôleur, HUD.

---

## 3) Pourquoi cette architecture ?

Le principe est de séparer les responsabilités :

- **rendu caméra** d’un côté (`Scene09Camera`),
- **contenu monde** de l’autre (`ProceduralTerrain`, `CityBlocks`),
- **logique joueur** isolée (`FpsController`),
- **coordination** au centre (`World`).

Ce découpage permet :

- de modifier le gameplay sans toucher au terrain,
- de remplacer le terrain sans casser les collisions,
- de tester chaque bloc mentalement de façon indépendante.

---

## 4) Terrain procédural : choix et logique

### 4.1 Géométrie de base

On part d’un `PlaneGeometry(size, size, segments, segments)` puis rotation pour l’aligner sur XZ.

Pourquoi ce choix :

- simple à comprendre,
- efficace pour une démo,
- compatible direct avec ombres, matériaux standards et Octree.

### 4.2 Fonction de hauteur

`getHeightAt(x, z)` combine plusieurs sin/cos de fréquences différentes :

- basse fréquence : relief large,
- fréquence moyenne : variation locale,
- combinaison diagonale : casse la symétrie.

Pourquoi ne pas utiliser du bruit Perlin/Simplex ici :

- moins de code et dépendances,
- lisible pédagogiquement,
- suffisamment "naturel" pour un prototype.

### 4.3 Couleur par altitude

Chaque sommet reçoit une couleur interpolée selon la hauteur.

Avantage :

- lecture visuelle immédiate du relief,
- pas besoin de texture externe,
- coût faible (vertex colors).

---

## 5) Immeubles procéduraux

`CityBlocks` génère un ensemble de boîtes :

- position aléatoire dans un disque (centre plus dense),
- dimensions X/Z variables (empreinte),
- hauteur Y variable (skyline),
- Y final ajusté avec `terrain.getHeightAt(x,z)` pour "poser" la base.

Pourquoi des box :

- primitives rapides à rendre,
- collisions prévisibles,
- parfaites pour expliquer l’Octree.

Pourquoi `material.clone()` :

- permet des variations de teinte par bâtiment,
- sans complexifier la logique.

---

## 6) Collisions : Octree + Capsule

### 6.1 Pourquoi un Octree ici ?

Le monde n’est plus une grille (contrairement scène 5).  
On a un espace continu avec beaucoup de triangles (terrain + boîtes).

Tester la capsule contre toutes les faces serait coûteux.

L’**Octree** partitionne l’espace 3D : on ne teste que les zones proches du joueur.

### 6.2 Construction

Dans `World.js` :

1. on regroupe terrain + immeubles dans `staticWorld`,
2. on force `updateMatrixWorld(true)`,
3. on construit `worldOctree.fromGraphNode(staticWorld)`.

Ce monde est statique : on construit une fois, puis on réutilise.

### 6.3 Forme du joueur : capsule

Le joueur est modélisé par une capsule (`start`, `end`, `radius`) :

- plus stable qu’une sphère pour un personnage debout,
- glisse naturellement sur les surfaces,
- meilleure gestion des marches/pentes que AABB stricte.

### 6.4 Résolution de collision

Chaque frame :

1. on intègre la vitesse (déplacement + gravité),
2. on translate la capsule,
3. `octree.capsuleIntersect(capsule)` renvoie normal + profondeur en cas d’intersection,
4. on repousse la capsule hors collision (`translate(normal * depth)`),
5. on ajuste la vitesse (suppression de la composante vers l’obstacle).

`onFloor` est déduit de `normal.y > 0`.

---

## 7) Mouvements FPS : choix de simulation

- `yaw/pitch` pilotés à la souris (pointer lock),
- direction locale recalculée à partir du yaw,
- accélération horizontale selon `WASD`,
- amortissement exponentiel (damping) pour éviter des arrêts brusques,
- gravité constante si en l’air,
- saut autorisé uniquement au sol.

Pourquoi ce modèle :

- simple mais crédible,
- comportement stable même avec variations de framerate (`dt` borné),
- facile à tuner (vitesse, gravité, saut, contrôle aérien).

---

## 8) HUD mini-map

La mini-map reprend l’idée de la scène 5 mais adaptée au relief continu :

- fond dessiné en "tuiles" échantillonnées depuis `getHeightAt`,
- point rouge = position joueur,
- trait blanc = direction de vue.

Pourquoi un rendu Canvas 2D :

- indépendant du pipeline WebGL,
- très peu coûteux,
- parfait pour un overlay UI.

---

## 9) Performances et compromis

### Points efficaces

- Octree construit une seule fois (monde statique),
- collisions locales (pas de balayage global),
- géométries simples (plane + boxes),
- HUD léger.

### Compromis assumés

- génération procédurale simple (sin/cos) au lieu de noise avancé,
- pas de streaming/chunks (terrain global en mémoire),
- immeubles non instanciés (lisibilité > perf max).

Pour une échelle "jeu plus grande", on pourrait :

- passer les bâtiments en `InstancedMesh`,
- chunker le terrain + octrees par zone,
- utiliser un noise fractal plus riche,
- ajouter culling plus agressif.

---

## 10) Résumé pédagogique

Cette scène illustre une transition importante :

- **scène 5** : logique grille (cellules, collisions discrètes),
- **scène 9** : logique monde continu (géométrie arbitraire, collisions spatiales).

L’Octree est ici le bon outil car il permet d’avoir :

- une collision générique contre des meshes complexes,
- un coût compatible temps réel,
- une API claire côté contrôleur (`capsuleIntersect`).

