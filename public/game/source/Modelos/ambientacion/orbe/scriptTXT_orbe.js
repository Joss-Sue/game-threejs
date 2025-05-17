import * as THREE from 'three';

// Cargar las texturas
const loader = new THREE.TextureLoader();
const baseColor = loader.load('/game/source/Modelos/ambientacion/orbe/textures/Done_Orb_Fix_Default_BaseColor.png');
const normalMap = loader.load('/game/source/Modelos/ambientacion/orbe/textures/Done_Orb_Fix_Default_Normal.png');
const roughnessMap = loader.load('/game/source/Modelos/ambientacion/orbe/textures/Done_Orb_Fix_Default_Roughness.png');
//const aoMap = loader.load('/game/source/Modelos/ambientacion/orbe/textures/Done_Orb_Fix_Default_AO.png');
const emissiveMap = loader.load('/game/source/Modelos/ambientacion/orbe/textures/Done_Orb_Fix_Default_Emissive.png');
//const heightMap = loader.load('/game/source/Modelos/ambientacion/orbe/textures/Done_Orb_Fix_Default_Height.png');
const metalnessMap = loader.load('/game/source/Modelos/ambientacion/orbe/textures/Done_Orb_Fix_Default_Metallic.png');

// Crear un material y asignarle las texturas
const texturaorbe = new THREE.MeshStandardMaterial({
    map: baseColor,
    normalMap: normalMap, 
    roughnessMap: roughnessMap, 
    emissiveMap: emissiveMap, 
    metalnessMap: metalnessMap, 
    transparent: true, 
    emissive: new THREE.Color(0xff0000),
    metalness: 1.0, 
    roughness: 0.5 
});


export {texturaorbe};