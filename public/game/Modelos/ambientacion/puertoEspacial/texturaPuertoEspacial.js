import * as THREE from 'three';

// Cargar las texturas
const loader = new THREE.TextureLoader();
const baseColor = loader.load('Modelos/ambientacion/puertoEspacial/texturas/puertoEspacialDiffuse.jpg');
const normalMap = loader.load('Modelos/ambientacion/puertoEspacial/texturas/puertoEspacialNormal.jpg');
const roughnessMap = loader.load('Modelos/ambientacion/puertoEspacial/texturas/puertoEspacialRoughness.jpg');
const emissiveMap = loader.load('Modelos/ambientacion/puertoEspacial/texturas/puertoEspacialLights.jpg');
const metalnessMap = loader.load('Modelos/ambientacion/puertoEspacial/texturas/puertoEspacialMetal.jpg');

// Crear un material y asignarle las texturas
const texturaPuertoEspcial = new THREE.MeshStandardMaterial({
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

export { texturaPuertoEspcial };