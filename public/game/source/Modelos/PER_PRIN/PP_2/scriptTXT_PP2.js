import * as THREE from 'three';

// Cargar las texturas
const loader = new THREE.TextureLoader();
const baseColor = loader.load('/game/source/Modelos/PER_PRIN/PP_2/DR_BC2.png');
const normalMap = loader.load('/game/source/Modelos/PER_PRIN/PP_1/DR_NO.png');
const roughnessMap = loader.load('/game/source/Modelos/PER_PRIN/PP_1/DR_RO.png');
const opacityMap = loader.load('/game/source/Modelos/PER_PRIN/PP_1/DR_OP.png');
const emissiveMap = loader.load('/game/source/Modelos/PER_PRIN/PP_1/DR_EM.png');
const metalnessMap = loader.load('/game/source/Modelos/PER_PRIN/PP_1/DR_ME.png');

// Crear un material y asignarle las texturas
const texturaDron2 = new THREE.MeshStandardMaterial({
    map: baseColor,
    normalMap: normalMap, 
    roughnessMap: roughnessMap,
    alphaMap: opacityMap, 
    emissiveMap: emissiveMap, 
    metalnessMap: metalnessMap, 
    transparent: true, 
    emissive: new THREE.Color(0x0000ff), 
    metalness: 1.0, 
    roughness: 0.5 
});

export {texturaDron2};