import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'

/**
 * Petite bille en matcap « blanc metal » sur la trajectoire (SplineCurve échantillonnée sur le floor).
 */
export default class Ball {
  /**
   * @param {import('./Floor.js').default} floor
   * @param {THREE.Texture} matcapTexture matcapBlueRed (blanc metal)
   */
  constructor(floor, matcapTexture) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.floor = floor

    const geo = new THREE.SphereGeometry(0.14, 24, 24)
    const mat =
      matcapTexture instanceof THREE.Texture
        ? new THREE.MeshMatcapMaterial({
            matcap: matcapTexture,
            color: new THREE.Color(0xffffff),
          })
        : new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.35,
            metalness: 0.65,
          })
    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.castShadow = true
    this.scene.add(this.mesh)

    /** Tours par seconde (fraction de la courbe [0,1)). */
    this.speed = 0.07
    /** @private */
    this._u = 0
  }

  update() {
    const dt = this.experience.time.delta * 0.001
    this._u = (this._u + dt * this.speed) % 1
    this.mesh.position.copy(this.floor.getPointAt(this._u))
  }
}
