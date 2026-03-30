import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'
import { createMaterialForType, disposeMaterial } from './Materials.js'

export default class Subjects {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    /** @type {THREE.Texture[]} */
    this.matcaps = [
      this.resources.items.matcapPorcelain,
      this.resources.items.matcapBlueRed,
      this.resources.items.matcapCeramic,
      this.resources.items.matcapClay,
    ]

    /** @type {{ id: string, label: string, mesh: THREE.Mesh, color: THREE.Color, materialType: string, matcapIndex: number, speed: number }[]} */
    this.entries = []

    this.setMeshes()
  }

  setMeshes() {
    const specs = [
      {
        id: 'box',
        label: 'Boîte',
        geometry: new THREE.BoxGeometry(1.4, 1.4, 1.4),
        color: new THREE.Color('#e84a5f'),
        // Espacer les objets plus visuellement
        position: new THREE.Vector3(-4.2, 0.9, -1.2),
        materialType: 'standard',
        matcapIndex: 0,
        speed: 0.42,
      },
      {
        id: 'sphere',
        label: 'Sphère',
        geometry: new THREE.SphereGeometry(1.1, 48, 48),
        color: new THREE.Color('#4ecdc4'),
        position: new THREE.Vector3(3.9, 1.15, -1.1),
        materialType: 'lambert',
        matcapIndex: 1,
        speed: 0.55,
      },
      {
        id: 'torus',
        label: 'Torus knot',
        geometry: new THREE.TorusKnotGeometry(0.75, 0.22, 120, 16),
        color: new THREE.Color('#ffe66d'),
        position: new THREE.Vector3(0.9, 1.35, 4.6),
        materialType: 'phong',
        matcapIndex: 2,
        speed: 0.38,
      },
    ]

    for (const s of specs) {
      const mat = createMaterialForType(s.materialType, {
        color: s.color,
        matcap: this.matcaps[s.matcapIndex] ?? this.matcaps[0],
      })
      const mesh = new THREE.Mesh(s.geometry, mat)
      mesh.position.copy(s.position)
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.scene.add(mesh)
      this.entries.push({
        id: s.id,
        label: s.label,
        mesh,
        color: s.color,
        materialType: s.materialType,
        matcapIndex: s.matcapIndex,
        speed: s.speed,
      })
    }
  }

  /**
   * @param {THREE.Mesh} mesh
   * @param {string} type
   * @param {number} matcapIndex
   */
  applyMaterialToMesh(mesh, type, matcapIndex) {
    const entry = this.entries.find((m) => m.mesh === mesh)
    if (!entry) return

    disposeMaterial(mesh.material)
    const matcap = this.matcaps[matcapIndex] ?? this.matcaps[0]
    mesh.material = createMaterialForType(type, {
      color: entry.color,
      matcap,
    })
    entry.materialType = type
    entry.matcapIndex = matcapIndex
  }

  update() {
    const t = this.experience.time.elapsed * 0.001
    for (const s of this.entries) {
      s.mesh.rotation.y = t * s.speed
    }
  }
}
