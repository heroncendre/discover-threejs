import * as THREE from 'three'

export default class Scene09Camera {
  /**
   * @param {import('../../../Experience/Experience.js').default} experience
   */
  constructor(experience) {
    this.experience = experience
    this.sizes = experience.sizes
    this.scene = experience.scene

    this._onResize = () => this.resize()
    this.sizes.on('resize', this._onResize)

    this.instance = new THREE.PerspectiveCamera(75, 1, 0.05, 400)
    this.instance.position.set(0, 1.7, 0)
    this.scene.add(this.instance)
    this.resize()
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {}

  destroy() {
    this.sizes.off('resize', this._onResize)
  }
}
