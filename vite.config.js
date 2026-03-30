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
      },
    },
  },
}
