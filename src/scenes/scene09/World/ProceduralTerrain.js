import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'

export default class ProceduralTerrain {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.size = 180
    this.segments = 140
    this.maxHeight = 10

    this.group = new THREE.Group()
    this.scene.add(this.group)

    this._buildTerrain()
  }

  getHeightAt(x, z) {
    const h1 = Math.sin(x * 0.06) * 2.0
    const h2 = Math.cos(z * 0.08) * 1.7
    const h3 = Math.sin((x + z) * 0.035) * 3.2
    const h4 = Math.cos((x - z) * 0.03) * 1.1
    return h1 + h2 + h3 + h4
  }

  _colorForHeight(y) {
    const t = THREE.MathUtils.clamp((y + this.maxHeight) / (this.maxHeight * 2), 0, 1)
    const c = new THREE.Color()
    c.setRGB(
      THREE.MathUtils.lerp(0.08, 0.36, t),
      THREE.MathUtils.lerp(0.16, 0.56, t),
      THREE.MathUtils.lerp(0.18, 0.28, t),
    )
    return c
  }

  _buildTerrain() {
    const geo = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments)
    geo.rotateX(-Math.PI * 0.5)

    const pos = geo.attributes.position
    /** @type {number[]} */
    const colors = []
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      const y = this.getHeightAt(x, z)
      pos.setY(i, y)

      const col = this._colorForHeight(y)
      colors.push(col.r, col.g, col.b)
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geo.computeVertexNormals()

    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.96,
      metalness: 0.02,
      vertexColors: true,
    })

    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.receiveShadow = true
    this.mesh.castShadow = false
    this.group.add(this.mesh)
  }
}
