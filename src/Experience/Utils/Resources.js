import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'
import EventEmitter from './EventEmitter.js'

export default class Resources extends EventEmitter {
  /** @param {import('../sources.js').default} sources */
  constructor(sources) {
    super()
    this.sources = sources
    this.items = {}
    this.toLoad = sources.length
    this.loaded = 0

    this.setLoaders()
    // État initial : 0% chargé.
    this.trigger('progress', { loaded: 0, total: this.toLoad, ratio: 0 })
    this.startLoading()
  }

  setLoaders() {
    this.loaders = {
      textureLoader: new THREE.TextureLoader(),
      gltfLoader: new GLTFLoader(),
      fbxLoader: new FBXLoader(),
    }
  }

  startLoading() {
    for (const source of this.sources) {
      if (source.type === 'texture') {
        this.loaders.textureLoader.load(
          source.path,
          (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace
            this.sourceLoaded(source, tex)
          },
          undefined,
          () => this.sourceLoadError(source),
        )
      } else if (source.type === 'gltfModel') {
        this.loaders.gltfLoader.load(
          source.path,
          (gltf) => this.sourceLoaded(source, gltf),
          undefined,
          () => this.sourceLoadError(source),
        )
      } else if (source.type === 'fbxModel') {
        this.loaders.fbxLoader.load(
          source.path,
          (fbx) => this.sourceLoaded(source, fbx),
          undefined,
          () => this.sourceLoadError(source),
        )
      }
    }
  }

  sourceLoadError(source) {
    console.error('Resources: échec de chargement', source)
    this.sourceLoaded(source, null)
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file
    this.loaded++
    const ratio = this.toLoad > 0 ? this.loaded / this.toLoad : 1
    this.trigger('progress', {
      loaded: this.loaded,
      total: this.toLoad,
      ratio,
    })
    if (this.loaded === this.toLoad) {
      queueMicrotask(() => this.trigger('ready'))
    }
  }
}
