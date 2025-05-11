import * as THREE from 'three';

const loader= new THREE.TextureLoader();
const baseColor=loader.load('Modelos/ENEMIGOS/ENEMY_1/ENEMY1_BC.PNG');

const texturaEnemy1 = new THREE.MeshStandardMaterial({
    map: baseColor, // Base color map
    roughness: .75 // Valor de roughness
});

export {texturaEnemy1};