import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { texturaENEM2 } from '../source/Modelos/ENEMIGOS/ENEMY_2/scriptTXT_EN2.js';

let mixer;
export const enemy2s = [];

export function cargarEnemy2(scene, clock, cantidad = 3) {
    const loader = new FBXLoader();

    loader.load('/game/Modelos/ENEMIGOS/ENEMY_2/BUG.fbx', (model) => {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = texturaENEM2;
            }
        });

        loader.load('/game/Modelos/ENEMIGOS/ENEMY_2/BUG_WALK.fbx', (anim) => {
            // Crear mixer sobre el modelo base
            mixer = new THREE.AnimationMixer(model);

            if (anim.animations.length > 0) {
                const action = mixer.clipAction(anim.animations[0]);
                action.play();
            }

            // Clonar enemigos
            for (let i = 0; i < cantidad; i++) {
                const enemy = model.clone(true);
                enemy.position.set(-80, -35, -50);
                enemy.scale.set(0.3, 0.3, 0.3);
                scene.add(enemy);
                enemy2s.push(enemy);
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
        if (mixer) mixer.update(delta);
    }
    update();
}
