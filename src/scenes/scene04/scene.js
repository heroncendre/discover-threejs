import '../../sceneNav.js'
import Experience from '../../Experience/Experience.js'
import World from './World/World.js'
import Scene04Camera from './World/Scene04Camera.js'

const canvas = document.querySelector('canvas.webgl')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas .webgl introuvable')
}

new Experience(canvas, World, {
  camerasFactory: (experience) => new Scene04Camera(experience),
})
