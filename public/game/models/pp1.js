import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { texturaDron } from '../source/Modelos/PER_PRIN/PP_1/scriptTXT_PP1.js';

export async function cargarPP1(scene) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load('/game/source/Modelos/PER_PRIN/PP_1/DRONE.fbx', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturaDron;
      });

      object.position.set(0, -35, -50);
      object.scale.set(0.3, 0.3, 0.3);
      scene.add(object);

      resolve(object);
    }, undefined, reject);
  });
}
