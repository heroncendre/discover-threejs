import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default class Scene04Camera {
  /**
   * @param {import('../../../Experience/Experience.js').default} experience
   */
  constructor(experience) {
    this.experience = experience
    this.sizes = experience.sizes
    this.scene = experience.scene
    this.canvas = experience.canvas

    this.instance = new THREE.PerspectiveCamera(42, this.sizes.width / this.sizes.height, 0.1, 140)
    this.instance.position.set(5.2, 4.2, 5.8)
    this.scene.add(this.instance)

    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.06
    this.controls.target.set(0, 0, 0)
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.55
    this.controls.minDistance = 3
    this.controls.maxDistance = 22
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
}
