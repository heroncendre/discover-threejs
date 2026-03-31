import '../../sceneNav.js'
import Experience from '../../Experience/Experience.js'
import World from './World/World.js'
import Scene05Camera from './World/Scene05Camera.js'

const canvas = document.querySelector('canvas.webgl')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas .webgl introuvable')
}

new Experience(canvas, World, {
  camerasFactory: (experience) => new Scene05Camera(experience),
})

const help = document.querySelector('[data-scene05-help]')
if (help) {
  window.setTimeout(() => {
    help.classList.add('scene05-help--hidden')
  }, 10000)
}
