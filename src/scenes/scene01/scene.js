import '../../sceneNav.js'
import Experience from '../../Experience/Experience.js'
import World from './World/World.js'

const canvas = document.querySelector('canvas.webgl')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas .webgl introuvable')
}

// Vite HMR : libère le singleton Experience avant re-création (sinon écran noir).
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.experience?.destroy?.()
  })
}

new Experience(canvas, World)
