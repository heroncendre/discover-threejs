/**
 * @typedef {(
 *   | { name: string, type: 'texture', path: string }
 *   | { name: string, type: 'gltfModel', path: string, url?: string }
 *   | { name: string, type: 'fbxModel', path: string, url?: string }
 * )} SourceItem
 */

/** @type {SourceItem[]} */
export default [
  { name: 'matcapPorcelain', type: 'texture', path: '/textures/matcap/matcap-1.png' },
  { name: 'matcapBlueRed', type: 'texture', path: '/textures/matcap/matcap-2.png' },
  { name: 'matcapCeramic', type: 'texture', path: '/textures/matcap/matcap-3.png' },
  { name: 'matcapClay', type: 'texture', path: '/textures/matcap/matcap-4.png' },
  // Modèles glTF / glb servis depuis `public/`
  // (dans ton repo actuel : ils sont dans `public/models/`).
  {
    name: 'bottle',
    type: 'gltfModel',
    path: '/models/bottle/scene.gltf',
    url: 'https://sketchfab.com/3d-models/small-bottle-761e522abb934b0a98063a9851728180#download',
  },
  {
    name: 'classicAcousticViolin',
    type: 'gltfModel',
    path: '/models/classic_acoustic_violin.glb',
    url: 'https://sketchfab.com/3d-models/classic-acoustic-violin-48ee34ec0f4842dfae25414f6f25a62d',
  },
  {
    name: 'waterWheel',
    type: 'gltfModel',
    path: '/models/water_wheel/scene.gltf',
    url: 'https://sketchfab.com/3d-models/water-wheel-da4e000e36f1484aa1fbf9f042e82401pres de chambeu',
  },
]
