import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { texturaENEM2 } from '/game/source/Modelos/ENEMIGOS/ENEMY_2/scriptTXT_EN2.js';

export const enemy2s = [];
export const enemy2Mixers = [];

export function cargarEnemy2(scene, clock, cantidad = 3) {
  const loader = new FBXLoader();

  loader.load('/game/source/Modelos/ENEMIGOS/ENEMY_2/BUG.fbx', (model) => {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = texturaENEM2;
      }
    });

    loader.load('/game/source/Modelos/ENEMIGOS/ENEMY_2/BUG_WALK.fbx', (anim) => {
      for (let i = 0; i < cantidad; i++) {
        const enemy = model.clone(true);
        enemy.position.set(-80 + i * 50, -35, -50); // Separados en X
        enemy.scale.set(0.3, 0.3, 0.3);
        scene.add(enemy);
        enemy2s.push(enemy);

        // Mixer y animación por cada clon
        const mixer = new THREE.AnimationMixer(enemy);
        const action = mixer.clipAction(anim.animations[0]);
        action.play();
        enemy2Mixers.push(mixer);
      }

      animate(clock);
    });
  }, undefined, (err) => {
    console.error('Error al cargar Enemy2:', err);
  });
}

function animate(clock) {
  function update() {
    requestAnimationFrame(update);
    const delta = clock.getDelta();

    // Actualiza todos los mixers de enemy2
    for (const mixer of enemy2Mixers) {
      mixer.update(delta);
    }
  }
  update();
}
