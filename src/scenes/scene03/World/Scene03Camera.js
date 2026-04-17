import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/**
 * Caméra dédiée scène 03 (shader sphère / sujet).
 * FOV 45°, clip court pour la démo ; **écoute `sizes`** pour l’aspect (voir doc `Experience.js`).
 */
export default class Scene03Camera {
  /**
   * @param {import('../../../Experience/Experience.js').default} experience
   */
  constructor(experience) {
    this.experience = experience
    this.sizes = experience.sizes
    this.scene = experience.scene
    this.canvas = experience.canvas

    this._onResize = () => this.resize()
    this.sizes.on('resize', this._onResize)

    this.instance = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 100)
    this.instance.position.set(0, 0, 5.8)
    this.scene.add(this.instance)

    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.06
    this.controls.target.set(0, 0, 0)
    this.controls.minDistance = 3.2
    this.controls.maxDistance = 9
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }

  dispose() {
    this.controls.dispose()
  }

  destroy() {
    this.sizes.off('resize', this._onResize)
  }
}
