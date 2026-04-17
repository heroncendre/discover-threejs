import '../../sceneNav.js'
import Experience from '../../Experience/Experience.js'
import World from './World/World.js'
import LoadingScreen from '../../Experience/Utils/LoadingScreen.js'

const canvas = document.querySelector('canvas.webgl')
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Canvas .webgl introuvable')
}

const loader = new LoadingScreen({ message: 'Chargement des modèles…' })

const experience = new Experience(canvas, World)

experience.resources.on('progress', ({ loaded, total, ratio }) => {
  loader.setProgress(ratio, `Chargement : ${loaded}/${total}`)
})

experience.resources.on('ready', () => {
  loader.hide()
})
