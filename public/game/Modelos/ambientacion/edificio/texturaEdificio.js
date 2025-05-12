import * as THREE from 'three';

// Cargar las texturas
const loader = new THREE.TextureLoader();
const baseColor = loader.load('/game/Modelos/ambientacion/edificio/texturas/edificioDiffuse.jpg');
const normalMap = loader.load('/game/Modelos/ambientacion/edificio/texturas/edificioNormal.jpg');
const roughnessMap = loader.load('/game/Modelos/ambientacion/edificio/texturas/edificioRoughness.jpg');
const emissiveMap = loader.load('/game/Modelos/ambientacion/edificio/texturas/edificioLights.jpg');
const metalnessMap = loader.load('/game/Modelos/ambientacion/edificio/texturas/edificioMetal.jpg');

// Crear un material y asignarle las texturas
const texturaEdificio = new THREE.MeshStandardMaterial({
    map: baseColor*5,
    normalMap: normalMap,
    roughnessMap: roughnessMap,
    emissiveMap: emissiveMap,
    metalnessMap: metalnessMap,
    transparent: true,
    emissive: new THREE.Color(0xff0000),
    metalness: 1.0,
    roughness: 0.5
});

export { texturaEdificio };