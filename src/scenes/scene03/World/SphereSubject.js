import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'
import vertexShader from '../shaders/sphere/vertex.glsl?raw'
import fragmentShader from '../shaders/sphere/fragment.glsl?raw'

export default class SphereSubject {
  /**
   * @param {import('./Environment.js').default} environment
   */
  constructor(environment) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.environment = environment
    this._tmpLightDir = new THREE.Vector3()

    this.geometry = new THREE.SphereGeometry(1.8, 128, 128)
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uBaseColor: { value: new THREE.Color('#6ea8ff') },
        uAmbientColor: { value: new THREE.Color('#1a1f2b') },
        uLightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  update() {
    const light = this.environment.directionalLight
    const target = light.target.position
    this._tmpLightDir.copy(light.position).sub(target).normalize()
    this.material.uniforms.uLightDirection.value.copy(this._tmpLightDir)
  }
}
