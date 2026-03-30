import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'
import createCheckerboardTexture from '../../../Experience/Utils/createCheckerboardTexture.js'

export default class Floor {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.setMesh()
  }

  setMesh() {
    const checker = createCheckerboardTexture({ size: 512, checks: 10 })
    const floorGeo = new THREE.PlaneGeometry(24, 24, 1, 1)
    const floorMat = new THREE.MeshStandardMaterial({
      map: checker,
      roughness: 0.85,
      metalness: 0.05,
    })
    this.mesh = new THREE.Mesh(floorGeo, floorMat)
    this.mesh.rotation.x = -Math.PI / 2
    this.mesh.receiveShadow = true
    this.scene.add(this.mesh)
  }
}
