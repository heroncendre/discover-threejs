import * as THREE from 'three'

export default class Scene05Camera {
  /**
   * @param {import('../../../Experience/Experience.js').default} experience
   */
  constructor(experience) {
    this.experience = experience
    this.sizes = experience.sizes
    this.scene = experience.scene

    this.instance = new THREE.PerspectiveCamera(70, 1, 0.05, 200)
    this.instance.position.set(0, 1.65, 0)
    this.scene.add(this.instance)
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {}
}
