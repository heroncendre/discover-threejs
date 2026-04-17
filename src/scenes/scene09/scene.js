import '../../sceneNav.js'
import Experience from '../../Experience/Experience.js'
import World from './World/World.js'
import Scene09Camera from './World/Scene09Camera.js'

const canvas = document.querySelector('canvas.webgl')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas .webgl introuvable')
}

new Experience(canvas, World, {
  camerasFactory: (experience) => new Scene09Camera(experience),
})

const help = document.querySelector('[data-scene09-help]')
if (help) {
  window.setTimeout(() => {
    help.classList.add('scene05-help--hidden')
  }, 10000)
}
