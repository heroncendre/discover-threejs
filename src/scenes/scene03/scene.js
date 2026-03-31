import '../../sceneNav.js'
import Experience from '../../Experience/Experience.js'
import World from './World/World.js'
import Scene03Camera from './World/Scene03Camera.js'

const canvas = document.querySelector('canvas.webgl')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas .webgl introuvable')
}

new Experience(canvas, World, {
  camerasFactory: (experience) => new Scene03Camera(experience),
})
