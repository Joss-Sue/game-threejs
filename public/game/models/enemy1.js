import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { texturaEnemy1 } from '../source/Modelos/ENEMIGOS/ENEMY_1/scriptTXT_EN1.js';

let mixer;
export const enemy1s = [];

export function cargarEnemy1(scene, clock, cantidad = 5) {
    const loader = new FBXLoader();

    loader.load('/game/Modelos/ENEMIGOS/ENEMY_1/ENEMY1.fbx', (model) => {
        model.traverse((child) => {
            if (child.isMesh) {
                child.material = texturaEnemy1;
            }
        });

        // Crear mixer sobre el modelo base
        mixer = new THREE.AnimationMixer(model);

        // Reproducir la primera animación (todas usarán la misma)
        if (model.animations.length > 0) {
            const action = mixer.clipAction(model.animations[0]);
            action.play();
        }

        // Crear clones
        for (let i = 0; i < cantidad; i++) {
            const enemy = model.clone(true);
            enemy.position.set(120, -35, -50);
            enemy.scale.set(0.2, 0.2, 0.2);
            scene.add(enemy);
            enemy1s.push(enemy);
        }

        animate(clock);
    }, undefined, (err) => {
        console.error('Error al cargar Enemy1:', err);
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
