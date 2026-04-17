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

    this.settings = {
      geometryType: 'sphere',
      lightOn: true,
    }

    this.geometry = this.createGeometry(this.settings.geometryType)
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uBaseColor: { value: new THREE.Color('#6ea8ff') },
        uAmbientColor: { value: new THREE.Color('#1a1f2b') },
        uLightColor: { value: new THREE.Color('#ffffff') },
        uLightOn: { value: 1.0 },
        uLightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)

    this.fitMeshToTargetRadius(1.8)

    // UI debug: géométrie + uniforms shader.
    if (this.experience.debug?.active && this.experience.debug.ui) {
      const f = this.experience.debug.ui.addFolder('Scene03 géométrie')
      f.add(this.settings, 'geometryType', ['sphere', 'cube', 'octahedron', 'torusKnot'])
        .name('Geometry')
        .onChange((v) => this.setGeometryType(v))

      const shaderFolder = this.experience.debug.ui.addFolder('Scene03 shader')
      shaderFolder
        .add(this.settings, 'lightOn')
        .name('Light on/off')
        .onChange((v) => {
          this.material.uniforms.uLightOn.value = v ? 1.0 : 0.0
        })
      shaderFolder.addColor(this.material.uniforms.uBaseColor, 'value').name('Color')
      shaderFolder.addColor(this.material.uniforms.uLightColor, 'value').name('Light color')
    }
  }

  /**
   * @param {'sphere' | 'cube' | 'octahedron' | 'torusKnot'} type
   */
  createGeometry(type) {
    switch (type) {
      case 'cube':
        // Segments élevés pour éviter un rendu trop facetté.
        return new THREE.BoxGeometry(3.6, 3.6, 3.6, 48, 48, 48)
      case 'octahedron':
        return new THREE.OctahedronGeometry(2.0, 5)
      case 'torusKnot':
        return new THREE.TorusKnotGeometry(1.35, 0.45, 170, 30)
      case 'sphere':
      default:
        return new THREE.SphereGeometry(1.8, 128, 128)
    }
  }

  /**
   * Remplace la géométrie et recale la taille visuelle.
   * @param {'sphere' | 'cube' | 'octahedron' | 'torusKnot'} type
   */
  setGeometryType(type) {
    if (type === this.settings.geometryType && this.mesh.geometry) {
      // on continue quand même, lil-gui passe la même valeur parfois
    }

    // Dispose l'ancienne géométrie pour éviter les fuites mémoire.
    this.mesh.geometry?.dispose?.()
    this.geometry = this.createGeometry(type)
    this.mesh.geometry = this.geometry
    this.fitMeshToTargetRadius(1.8)
  }

  /**
   * Centre + scale la mesh pour qu'elle prenne une taille cohérente.
   * @param {number} targetRadius
   */
  fitMeshToTargetRadius(targetRadius) {
    this.mesh.scale.setScalar(1)

    const box = new THREE.Box3().setFromObject(this.mesh)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z, 1e-6)

    const desiredDiameter = targetRadius * 2
    const scale = desiredDiameter / maxDim
    this.mesh.scale.setScalar(scale)
  }

  update() {
    const light = this.environment.directionalLight
    const target = light.target.position
    this._tmpLightDir.copy(light.position).sub(target).normalize()
    this.material.uniforms.uLightDirection.value.copy(this._tmpLightDir)
  }
}
