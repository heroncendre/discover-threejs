import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'

/**
 * Démo draw calls:
 * - meshes: 1 triangle = 1 mesh
 * - oneMesh: 1 mesh pour tous les triangles
 * - instancedMesh: 1 triangle instancié
 */
export default class DrawCallLab {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.mode = 'meshes'
    this.triangleCount = 2000
    this.cubeHalfSize = 1.8
    // Taille figée, calée sur l'apparence de la version 12k.
    this.triangleRadius = this.cubeHalfSize * 0.09

    this.group = new THREE.Group()
    this.scene.add(this.group)

    this._rng = Math.random
    this._tmpPos = new THREE.Vector3()
    this._tmpScale = new THREE.Vector3()
    this._tmpQuat = new THREE.Quaternion()
    this._tmpEuler = new THREE.Euler()
    this._tmpMatrix = new THREE.Matrix4()
    this._tmpA = new THREE.Vector3()
    this._tmpB = new THREE.Vector3()
    this._tmpC = new THREE.Vector3()
    this._tmpCenter = new THREE.Vector3()

    this.material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    })

    this.rebuild()
  }

  setMode(mode) {
    if (this.mode === mode) return
    this.mode = mode
    this.rebuild()
  }

  setTriangleCount(count) {
    const safe = Math.max(100, Math.floor(count))
    if (this.triangleCount === safe) return
    this.triangleCount = safe
    this.rebuild()
  }

  rebuild() {
    this._disposeChildren()
    if (this.mode === 'meshes') this._buildAsMeshes()
    else if (this.mode === 'oneMesh') this._buildAsOneMesh()
    else this._buildAsInstancedMesh()
  }

  _disposeChildren() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0]
      this.group.remove(child)
      child.geometry?.dispose?.()
    }
  }

  _randomPointInBoundingBox() {
    const h = this.cubeHalfSize
    return new THREE.Vector3(
      (this._rng() * 2 - 1) * h,
      (this._rng() * 2 - 1) * h,
      (this._rng() * 2 - 1) * h,
    )
  }

  _randomColor() {
    return new THREE.Color(this._rng(), this._rng(), this._rng())
  }

  _makeTransformedTriangleVertices() {
    this._tmpCenter.copy(this._randomPointInBoundingBox())
    this._tmpEuler.set(this._rng() * Math.PI, this._rng() * Math.PI, this._rng() * Math.PI)
    this._tmpQuat.setFromEuler(this._tmpEuler)

    this._tmpMatrix.compose(this._tmpCenter, this._tmpQuat, this._tmpScale.set(1, 1, 1))

    this._tmpA.set(-0.7, -0.4, 0.0).multiplyScalar(this.triangleRadius).applyMatrix4(this._tmpMatrix)
    this._tmpB.set(0.7, -0.4, 0.0).multiplyScalar(this.triangleRadius).applyMatrix4(this._tmpMatrix)
    this._tmpC.set(0.0, 0.8, 0.0).multiplyScalar(this.triangleRadius).applyMatrix4(this._tmpMatrix)
  }

  _buildAsMeshes() {
    for (let i = 0; i < this.triangleCount; i += 1) {
      this._makeTransformedTriangleVertices()
      const color = this._randomColor()

      const positions = new Float32Array([
        this._tmpA.x,
        this._tmpA.y,
        this._tmpA.z,
        this._tmpB.x,
        this._tmpB.y,
        this._tmpB.z,
        this._tmpC.x,
        this._tmpC.y,
        this._tmpC.z,
      ])
      const colors = new Float32Array([
        color.r,
        color.g,
        color.b,
        color.r,
        color.g,
        color.b,
        color.r,
        color.g,
        color.b,
      ])
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const triangle = new THREE.Mesh(geometry, this.material)
      this.group.add(triangle)
    }
  }

  _buildAsOneMesh() {
    const positions = new Float32Array(this.triangleCount * 9)
    const colors = new Float32Array(this.triangleCount * 9)
    for (let i = 0; i < this.triangleCount; i += 1) {
      this._makeTransformedTriangleVertices()
      const color = this._randomColor()
      const o = i * 9

      positions[o + 0] = this._tmpA.x
      positions[o + 1] = this._tmpA.y
      positions[o + 2] = this._tmpA.z
      positions[o + 3] = this._tmpB.x
      positions[o + 4] = this._tmpB.y
      positions[o + 5] = this._tmpB.z
      positions[o + 6] = this._tmpC.x
      positions[o + 7] = this._tmpC.y
      positions[o + 8] = this._tmpC.z

      colors[o + 0] = color.r
      colors[o + 1] = color.g
      colors[o + 2] = color.b
      colors[o + 3] = color.r
      colors[o + 4] = color.g
      colors[o + 5] = color.b
      colors[o + 6] = color.r
      colors[o + 7] = color.g
      colors[o + 8] = color.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mesh = new THREE.Mesh(geometry, this.material)
    this.group.add(mesh)
  }

  _buildAsInstancedMesh() {
    const baseSize = this.triangleRadius
    const positions = new Float32Array([
      -0.7 * baseSize,
      -0.4 * baseSize,
      0.0,
      0.7 * baseSize,
      -0.4 * baseSize,
      0.0,
      0.0,
      0.8 * baseSize,
      0.0,
    ])
    const colors = new Float32Array([
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
      1.0,
    ])
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mesh = new THREE.InstancedMesh(geometry, this.material, this.triangleCount)
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    for (let i = 0; i < this.triangleCount; i += 1) {
      this._tmpPos.copy(this._randomPointInBoundingBox())
      this._tmpEuler.set(this._rng() * Math.PI, this._rng() * Math.PI, this._rng() * Math.PI)
      this._tmpQuat.setFromEuler(this._tmpEuler)

      const color = this._randomColor()
      this._tmpScale.set(1, 1, 1)
      this._tmpMatrix.compose(this._tmpPos, this._tmpQuat, this._tmpScale)
      mesh.setMatrixAt(i, this._tmpMatrix)
      mesh.setColorAt(i, color)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    this.group.add(mesh)
  }
}
