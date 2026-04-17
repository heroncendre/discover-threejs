import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'
import createCheckerboardTexture from '../../../Experience/Utils/createCheckerboardTexture.js'

/**
 * Sol + trajectoire fermée (SplineCurve 2D sur XZ) dessinée sur le plan.
 */
export default class Floor {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    /** @type {THREE.Vector3[]} */
    this.pathPoints = []
    this.pathSegmentCount = 420

    this.setMesh()
    this.setPathCurve()
  }

  setMesh() {
    const checker = createCheckerboardTexture({ size: 512, checks: 10 })
    const floorGeo = new THREE.PlaneGeometry(28, 28, 1, 1)
    const floorMat = new THREE.MeshStandardMaterial({
      map: checker,
      roughness: 0.88,
      metalness: 0.04,
    })
    this.mesh = new THREE.Mesh(floorGeo, floorMat)
    this.mesh.rotation.x = -Math.PI / 2
    this.mesh.receiveShadow = true
    this.scene.add(this.mesh)
  }

  /**
   * Courbe sinusoïde fermée : devant la boîte, derrière la sphère, boucle autour du torus.
   * SplineCurve (Vector2 xz) ; premier point répété en fin pour fermeture.
   */
  setPathCurve() {
    const h = 0.06
    const ctrl = [
      new THREE.Vector2(-3.2, 2.4),
      new THREE.Vector2(-5.2, 0.9),
      new THREE.Vector2(-5.8, -1.6),
      new THREE.Vector2(-4.2, -3.2),
      new THREE.Vector2(-1.2, -3.0),
      new THREE.Vector2(2.2, -3.4),
      new THREE.Vector2(5.6, -2.0),
      new THREE.Vector2(6.2, 0.2),
      new THREE.Vector2(4.8, 2.6),
      new THREE.Vector2(2.0, 4.8),
      new THREE.Vector2(-1.2, 6.2),
      new THREE.Vector2(-0.2, 7.8),
      new THREE.Vector2(2.4, 8.6),
      new THREE.Vector2(4.2, 6.4),
      new THREE.Vector2(3.0, 3.6),
      new THREE.Vector2(0.2, 2.2),
      new THREE.Vector2(-2.0, 3.4),
      new THREE.Vector2(-3.2, 2.4),
    ]

    const curve = new THREE.SplineCurve(ctrl)
    this.pathPoints = []
    const n = this.pathSegmentCount
    for (let i = 0; i <= n; i++) {
      const u = i / n
      const p = curve.getPoint(u)
      this.pathPoints.push(new THREE.Vector3(p.x, h, p.y))
    }

    const lineGeo = new THREE.BufferGeometry().setFromPoints(this.pathPoints)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7ab8ff, toneMapped: false })
    this.pathLine = new THREE.LineLoop(lineGeo, lineMat)
    this.scene.add(this.pathLine)
  }

  /**
   * @param {number} u dans [0, 1)
   */
  getPointAt(u) {
    const n = this.pathPoints.length
    if (n < 2) return new THREE.Vector3()
    const t = ((u % 1) + 1) % 1
    const f = t * n
    const i0 = Math.floor(f) % n
    const i1 = (i0 + 1) % n
    const a = f - Math.floor(f)
    return this.pathPoints[i0].clone().lerp(this.pathPoints[i1], a)
  }

  getTangentAt(u) {
    const eps = 1 / this.pathSegmentCount
    const a = this.getPointAt(u)
    const b = this.getPointAt(u + eps)
    return b.sub(a).normalize()
  }
}
