import * as THREE from 'three';

const loader= new THREE.TextureLoader();

const texturaENEM2 = new THREE.MeshStandardMaterial({
    map: loader.load('Modelos/ENEMIGOS/ENEMY_2/BUG_BC.png'), 
    normalMap: loader.load('Modelos/ENEMIGOS/ENEMY_2/BUG_NO.png'), 
    aoMap: loader.load('Modelos/ENEMIGOS/ENEMY_2/BUG_AO.png'), // Ahora es válido
    roughnessMap: loader.load('Modelos/ENEMIGOS/ENEMY_2/BUG_RO.png')
});

export {texturaENEM2};