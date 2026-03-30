import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'

/**
 * Scène 2 : à l’emplacement de l’ancien **cube** → modèle **bottle** (`sources.bottle`).
 * À l’emplacement de l’ancienne **sphère** → modèle **classic_acoustic_violin** (`sources.classicAcousticViolin`).
 * À l’emplacement de l’ancien **torus knot** → modèle **water_wheel** (`sources.waterWheel`).
 * Les modèles gardent leurs matériaux.
 */
export default class Subjects {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    /** @type {{ id: string, label: string, root: THREE.Object3D }[]} */
    this.entries = []

    this.setMeshes()
  }

  /**
   * @param {THREE.Object3D} root
   * @param {{ x: number, z: number }} xz centre horizontal cible (pose au sol, y = 0)
   * @param {number} targetHeight hauteur cible après mise à l’échelle
   */
  _fitAndPlaceRoot(root, xz, targetHeight = 2.1) {
    root.position.set(0, 0, 0)
    root.scale.set(1, 1, 1)
    root.updateMatrixWorld(true)

    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const h = Math.max(size.y, 0.001)
    const s = targetHeight / h
    root.scale.setScalar(s)
    root.updateMatrixWorld(true)

    box.setFromObject(root)
    const center = box.getCenter(new THREE.Vector3())

    root.position.set(xz.x - center.x, -box.min.y, xz.z - center.z)
  }

  /** @param {THREE.Object3D} root */
  _tagPickRoot(root) {
    root.traverse((o) => {
      o.userData.pickRoot = root
    })
  }

  setMeshes() {
    const bottleGltf = this.resources.items.bottle
    const violinGltf = this.resources.items.classicAcousticViolin
    const waterWheelGltf = this.resources.items.waterWheel

    if (bottleGltf?.scene) {
      const root = bottleGltf.scene.clone(true)
      this._fitAndPlaceRoot(root, { x: -4.2, z: -1.2 }, 2.2)
      root.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.castShadow = true
          c.receiveShadow = true
        }
      })
      this._tagPickRoot(root)
      this.scene.add(root)
      this.entries.push({ id: 'box', label: 'Bouteille (glTF)', root })
    } else {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.4, 1.4),
        new THREE.MeshStandardMaterial({ color: '#e84a5f', roughness: 0.45, metalness: 0.2 }),
      )
      mesh.position.set(-4.2, 0.9, -1.2)
      mesh.castShadow = true
      mesh.receiveShadow = true
      this._tagPickRoot(mesh)
      this.scene.add(mesh)
      this.entries.push({ id: 'box', label: 'Cube (secours)', root: mesh })
    }

    if (violinGltf?.scene) {
      const root = violinGltf.scene.clone(true)
      this._fitAndPlaceRoot(root, { x: 3.9, z: -1.1 }, 1.7)
      root.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.castShadow = true
          c.receiveShadow = true
        }
      })
      this._tagPickRoot(root)
      this.scene.add(root)
      this.entries.push({ id: 'sphere', label: 'classic_acoustic_violin (glTF)', root })
    } else {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 48, 48),
        new THREE.MeshStandardMaterial({ color: '#4ecdc4', roughness: 0.45, metalness: 0.2 }),
      )
      mesh.position.set(3.9, 1.15, -1.1)
      mesh.castShadow = true
      mesh.receiveShadow = true
      this._tagPickRoot(mesh)
      this.scene.add(mesh)
      this.entries.push({ id: 'sphere', label: 'Sphère (secours)', root: mesh })
    }

    if (waterWheelGltf?.scene) {
      const root = waterWheelGltf.scene.clone(true)
      this._fitAndPlaceRoot(root, { x: 0.9, z: 4.6 }, 3.1)
      root.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          c.castShadow = true
          c.receiveShadow = true
        }
      })
      this._tagPickRoot(root)
      this.scene.add(root)
      this.entries.push({ id: 'torus', label: 'Water wheel (glTF)', root })
    } else {
      const torus = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.75, 0.22, 120, 16),
        new THREE.MeshStandardMaterial({ color: '#ffe66d', roughness: 0.45, metalness: 0.2 }),
      )
      torus.position.set(0.9, 1.35, 4.6)
      torus.castShadow = true
      torus.receiveShadow = true
      this._tagPickRoot(torus)
      this.scene.add(torus)
      this.entries.push({ id: 'torus', label: 'Torus knot (secours)', root: torus })
    }
  }

  /** Racines des sujets (glTF groupes ou meshes) pour raycast récursif. */
  getRaycastRoots() {
    return this.entries.map((e) => e.root)
  }

  update() {}
}
