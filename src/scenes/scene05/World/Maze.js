import * as THREE from 'three'
import Experience from '../../../Experience/Experience.js'
import createCheckerboardTexture from '../../../Experience/Utils/createCheckerboardTexture.js'

const LAYOUT = [
  '1111111111111111',
  '1S00001000000001',
  '1011100110111101',
  '1000100000100001',
  '1110101110101101',
  '1000101000101001',
  '1011101011101011',
  '1000001000000001',
  '1011111011111101',
  '1000000010000001',
  '1111111111111111',
]

export default class Maze {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.cellSize = 2
    this.wallHeight = 2.8
    this.rows = LAYOUT.length
    this.cols = LAYOUT[0].length
    this.width = this.cols * this.cellSize
    this.depth = this.rows * this.cellSize

    this.group = new THREE.Group()
    this.scene.add(this.group)

    this.wallMaterial = this._createWallMaterial()
    this.floorMaterial = this._createFloorMaterial()

    this._buildFloor()
    this._buildWalls()
  }

  _createWallMaterial() {
    const wallTexture = createCheckerboardTexture({ checks: 10 })
    // Repeats entiers alignés au ratio 2.0 x 2.8 (=> 10 x 14) pour garder des carreaux carrés.
    const repeatsX = 1
    const repeatsY = this.cellSize / this.wallHeight
    wallTexture.repeat.set(repeatsX, repeatsY)
    return new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.85, metalness: 0.02 })
  }

  _createFloorMaterial() {
    const floorTexture = createCheckerboardTexture({ checks: 16 })
    floorTexture.repeat.set(this.cols * 0.35, this.rows * 0.35)
    return new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.95, metalness: 0.0 })
  }

  _cellCenterWorld(col, row) {
    const x = (col + 0.5) * this.cellSize - this.width * 0.5
    const z = (row + 0.5) * this.cellSize - this.depth * 0.5
    return new THREE.Vector3(x, 0, z)
  }

  _buildFloor() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(this.width, this.depth, this.cols, this.rows),
      this.floorMaterial,
    )
    floor.rotation.x = -Math.PI * 0.5
    floor.receiveShadow = true
    this.group.add(floor)
  }

  _buildWalls() {
    const wallGeo = new THREE.BoxGeometry(this.cellSize, this.wallHeight, this.cellSize)
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        if (LAYOUT[row][col] !== '1') continue
        const cellCenter = this._cellCenterWorld(col, row)
        const wall = new THREE.Mesh(wallGeo, this.wallMaterial)
        wall.position.set(cellCenter.x, this.wallHeight * 0.5, cellCenter.z)
        wall.castShadow = true
        wall.receiveShadow = true
        this.group.add(wall)
      }
    }
  }

  getSpawnPosition(y = 1.65) {
    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        if (LAYOUT[row][col] !== 'S') continue
        const p = this._cellCenterWorld(col, row)
        return new THREE.Vector3(p.x, y, p.z)
      }
    }
    return new THREE.Vector3(0, y, 0)
  }

  _worldToCell(v) {
    const col = Math.floor((v.x + this.width * 0.5) / this.cellSize)
    const row = Math.floor((v.z + this.depth * 0.5) / this.cellSize)
    return { col, row }
  }

  isWallCell(col, row) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return true
    return LAYOUT[row][col] === '1'
  }

  getNearestWallDistanceXZ(position) {
    let minDistance = Number.POSITIVE_INFINITY

    for (let row = 0; row < this.rows; row += 1) {
      for (let col = 0; col < this.cols; col += 1) {
        if (!this.isWallCell(col, row)) continue

        const c = this._cellCenterWorld(col, row)
        const half = this.cellSize * 0.5
        const left = c.x - half
        const right = c.x + half
        const top = c.z - half
        const bottom = c.z + half

        const closestX = Math.max(left, Math.min(position.x, right))
        const closestZ = Math.max(top, Math.min(position.z, bottom))
        const dx = position.x - closestX
        const dz = position.z - closestZ
        const d = Math.sqrt(dx * dx + dz * dz)
        if (d < minDistance) minDistance = d
      }
    }

    return minDistance
  }

  collidesCircleXZ(position, radius) {
    const min = new THREE.Vector3(position.x - radius, 0, position.z - radius)
    const max = new THREE.Vector3(position.x + radius, 0, position.z + radius)
    const minCell = this._worldToCell(min)
    const maxCell = this._worldToCell(max)

    for (let row = minCell.row; row <= maxCell.row; row += 1) {
      for (let col = minCell.col; col <= maxCell.col; col += 1) {
        if (!this.isWallCell(col, row)) continue

        const c = this._cellCenterWorld(col, row)
        const half = this.cellSize * 0.5
        const left = c.x - half
        const right = c.x + half
        const top = c.z - half
        const bottom = c.z + half

        const closestX = Math.max(left, Math.min(position.x, right))
        const closestZ = Math.max(top, Math.min(position.z, bottom))
        const dx = position.x - closestX
        const dz = position.z - closestZ
        if (dx * dx + dz * dz < radius * radius) {
          return true
        }
      }
    }
    return false
  }
}
