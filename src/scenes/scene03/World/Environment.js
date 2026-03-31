import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.6)
    this.directionalLight.position.set(3.5, 2.2, 4.8)
    this.directionalLight.target.position.set(0, 0, 0)

    this.scene.add(this.directionalLight)
    this.scene.add(this.directionalLight.target)
  }
}
