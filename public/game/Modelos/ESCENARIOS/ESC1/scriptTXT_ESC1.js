import * as THREE from 'three';

const loader= new THREE.TextureLoader();
const baseColor=loader.load('Modelos/ESCENARIOS/ESC1/ESC1_BC.jpg');
const roughnessMap=loader.load('Modelos/ESCENARIOS/ESC1/ESC1_RO.jpg');
const normalMap=loader.load('Modelos/ESCENARIOS/ESC1/ESC1_NO.jpg');

const texturaESC1 = new THREE.MeshStandardMaterial({
    map: baseColor, // Base color map
    normalMap: normalMap, // Normal map
    roughnessMap: roughnessMap, // Roughness map
    roughness: .75 // Valor de roughness
});

export {texturaESC1};