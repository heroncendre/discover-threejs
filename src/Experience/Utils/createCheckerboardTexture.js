import * as THREE from 'three'

export default function createCheckerboardTexture({ size = 512, checks = 8 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const step = size / checks
  for (let y = 0; y < checks; y++) {
    for (let x = 0; x < checks; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#dcd8d0' : '#4a4a52'
      ctx.fillRect(x * step, y * step, step, step)
    }
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  tex.anisotropy = 8
  return tex
}
