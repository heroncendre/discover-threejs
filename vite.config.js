import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default {
  root,
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        scene01: resolve(root, 'scene01.html'),
        scene02: resolve(root, 'scene02.html'),
        scene03: resolve(root, 'scene03.html'),
        scene04: resolve(root, 'scene04.html'),
        scene05: resolve(root, 'scene05.html'),
        scene06: resolve(root, 'scene06.html'),
        scene07: resolve(root, 'scene07.html'),
      },
    },
  },
}
