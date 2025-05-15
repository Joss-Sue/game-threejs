import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { texturaDron2 } from '../source/Modelos/PER_PRIN/PP_2/scriptTXT_PP2.js';

export async function cargarPP2(scene) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();
    loader.load('/game/source/Modelos/PER_PRIN/PP_1/DRONE.fbx', (object) => {
      object.traverse(child => {
        if (child.isMesh) child.material = texturaDron2;
      });

      object.position.set(60, -35, -50);
      object.scale.set(0.3, 0.3, 0.3);
      scene.add(object);

      resolve(object);
    }, undefined, reject);
  });
}
