import * as THREE from 'three';

// Cargar las texturas
const loader = new THREE.TextureLoader();
const baseColor = loader.load('Modelos/ambientacion/nave/texturas/naveDiffuse.jpg');
const normalMap = loader.load('Modelos/ambientacion/nave/texturas/naveNormal.jpg');
const roughnessMap = loader.load('Modelos/ambientacion/nave/texturas/naveRoughness.jpg');
const emissiveMap = loader.load('Modelos/ambientacion/nave/texturas/naveEmission.jpg');
const metalnessMap = loader.load('Modelos/ambientacion/nave/texturas/naveMetal.jpg');

// Crear un material y asignarle las texturas
const texturaNave = new THREE.MeshStandardMaterial({
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

export { texturaNave };