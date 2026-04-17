import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'

export default class CityBlocks {
  /**
   * @param {import('./ProceduralTerrain.js').default} terrain
   */
  constructor(terrain) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.terrain = terrain

    this.group = new THREE.Group()
    this.scene.add(this.group)
    /** @type {{ x: number, z: number, sx: number, sz: number }[]} */
    this.blocks = []

    this._build()
  }

  _heightAt(x, z) {
    return this.terrain.getHeightAt(x, z)
  }

  _build() {
    let seed = 123456789
    const rng = () => {
      seed = (1664525 * seed + 1013904223) >>> 0
      return seed / 4294967296
    }
    const base = new THREE.BoxGeometry(1, 1, 1)
    const mat = new THREE.MeshStandardMaterial({
      color: '#a8b2c5',
      roughness: 0.82,
      metalness: 0.06,
    })

    const cityRadius = this.terrain.size * 0.42
    const count = 45
    for (let i = 0; i < count; i += 1) {
      const a = i * 0.618 + rng() * Math.PI * 2
      const r = Math.sqrt(rng()) * cityRadius
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r

      const sx = THREE.MathUtils.lerp(2.2, 8.2, rng())
      const sz = THREE.MathUtils.lerp(2.2, 8.2, rng())
      const sy = THREE.MathUtils.lerp(6, 38, rng())
      const y = this._heightAt(x, z)

      const b = new THREE.Mesh(base, mat.clone())
      b.scale.set(sx, sy, sz)
      b.position.set(x, y + sy * 0.5, z)
      b.castShadow = true
      b.receiveShadow = true

      const shade = THREE.MathUtils.lerp(0.75, 1.15, rng())
      b.material.color.multiplyScalar(shade)

      this.group.add(b)
      this.blocks.push({ x, z, sx, sz })
    }
  }
}
