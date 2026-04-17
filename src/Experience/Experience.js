import * as THREE from 'three'
import sources from './sources.js'
import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Resources from './Utils/Resources.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'

let instance = null

/**
 * ---------------------------------------------------------------------------
 * PerspectiveCamera dans ce dépôt — pourquoi plusieurs façons de l’instancier ?
 * ---------------------------------------------------------------------------
 *
 * `THREE.PerspectiveCamera(fov, aspect, near, far)` :
 * - **fov** : angle vertical en degrés (souvent 40–55 pour une vue “propre”, plus large pour FPS ou effet immersif).
 * - **aspect** : largeur / hauteur du **viewport de rendu** (canvas). Doit suivre le redimensionnement, sinon l’image est étirée.
 * - **near / far** : plans de découpe profondeur. `near` trop petit → artefacts de précision z ; `far` trop petit → la scène est coupée au loin.
 *
 * **1) Caméra par défaut (`new Camera()` dans Experience)**  
 * Utilisée quand aucune `camerasFactory` n’est fournie (ex. scène 01, gabarit générique).  
 * La classe `Camera` crée une `PerspectiveCamera` avec `this.sizes.aspect` et **s’abonne elle-même** à `sizes` pour mettre à jour `aspect` au resize. C’est le modèle “une caméra Orbit + Experience”.
 *
 * **2) `camerasFactory(experience)` (scènes 02–05, etc.)**  
 * Quand la scène impose une caméra dédiée (FOV différent, multi-cam, pas d’Orbit, etc.).  
 * L’objet retourné expose `instance`, `resize()`, `update()`, et doit **s’abonner à `experience.sizes`** pour le resize (comme `Camera` / `Renderer`), et implémenter `destroy()` pour se désabonner + libérer les contrôles si besoin.
 *
 * **3) Scripts de scène autonomes (ex. scene06, scene07)**  
 * Pas de singleton `Experience` : le module crée directement `new THREE.PerspectiveCamera(...)` et branche `window.addEventListener('resize', …)` (ou équivalent) sur le canvas plein écran. Utile pour une page HTML isolée sans boucle Experience.
 *
 * **Resize** : `Sizes` émet `resize` quand la fenêtre change. Chaque composant qui dépend de la taille (renderer, caméra, etc.) **écoute `sizes` et applique sa propre mise à jour** — `Experience` ne centralise plus le resize.
 *
 * @typedef {{
 *   camerasFactory?: (experience: Experience) => {
 *     instance: THREE.Camera
 *     resize: () => void
 *     update: () => void
 *     controls?: { dispose: () => void }
 *     dispose?: () => void
 *     destroy?: () => void
 *   }
 * }} ExperienceOptions
 */

export default class Experience {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {new () => { update: () => void }} WorldClass
   * @param {ExperienceOptions} [options]
   */
  constructor(canvas, WorldClass, options = {}) {
    if (instance) {
      return instance
    }
    instance = this

    this.canvas = canvas
    window.experience = this

    this.debug = new Debug()
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#0b0c10')

    this.resources = new Resources(sources)
    // Le monde est créé avant la caméra pour que les scènes multi-cam puissent s’y rattacher au `ready`.
    this.world = new WorldClass()

    this.camera =
      typeof options.camerasFactory === 'function'
        ? options.camerasFactory(this)
        : new Camera()

    this.renderer = new Renderer()

    this._onTick = () => this.update()
    this.time.on('tick', this._onTick)
  }

  update() {
    this.world.update()
    this.camera.update()
    this.renderer.update()
  }

  destroy() {
    this.time.off('tick', this._onTick)

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose()
        const mat = child.material
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
        else mat?.dispose()
      }
    })

    if (typeof this.camera.dispose === 'function') {
      this.camera.dispose()
    } else {
      this.camera.controls?.dispose()
    }
    this.camera.destroy?.()
    this.renderer.destroy()
    this.renderer.instance.dispose()
    this.debug.destroy()
    instance = null
  }
}

// Vite HMR : sans teardown, le singleton `instance` survit et le prochain
// `new Experience()` retourne l’ancienne instance (souvent déjà détruite) → écran noir.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (instance) {
      instance.destroy()
    }
  })
}
