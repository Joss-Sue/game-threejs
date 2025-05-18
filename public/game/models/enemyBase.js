// enemyBase.js
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { texturaENEM2 } from '/game/source/Modelos/ENEMIGOS/ENEMY_2/scriptTXT_EN2.js';

let enemigo = null;
let mixer = null;

export function getEnemigo() {
  return enemigo;
}

export function cargarEnemigo(scene, clock) {
  const loader = new FBXLoader();

  loader.load('/game/source/Modelos/ENEMIGOS/ENEMY_2/BUG.fbx', (model) => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = texturaENEM2;
      }
    });

    // Escalado y posicionamiento
    model.scale.set(0.3, 0.3, 0.3);
    model.position.set(-80, -35, -50);

    scene.add(model);
    enemigo = model;

    // Animación WALK
    loader.load('/game/source/Modelos/ENEMIGOS/ENEMY_2/BUG_WALK.fbx', (anim) => {
      mixer = new THREE.AnimationMixer(enemigo);
      const action = mixer.clipAction(anim.animations[0]);
      action.play();
    });
  });
}

export function actualizarEnemigo(jugadores, clock, velocidad = 120) {
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  if (!enemigo || jugadores.length === 0) return;

  // Buscar al jugador más cercano
  let objetivo = jugadores[0];
  let distanciaMin = enemigo.position.distanceTo(objetivo.position);

  for (let i = 1; i < jugadores.length; i++) {
    const d = enemigo.position.distanceTo(jugadores[i].position);
    if (d < distanciaMin) {
      distanciaMin = d;
      objetivo = jugadores[i];
    }
  }

  enemigo.lookAt(objetivo.position);
  enemigo.translateZ(velocidad * delta);
}

