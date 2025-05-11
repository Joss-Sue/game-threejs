import * as THREE from 'three';

// Cargar las texturas
const loader = new THREE.TextureLoader();
const baseColor = loader.load('Modelos/ambientacion/satelite/lambert1_albedo.jpg');
const normalMap = loader.load('Modelos/ambientacion/satelite/lambert1_normal.png');
const roughnessMap = loader.load('Modelos/ambientacion/satelite/lambert1_roughness.jpg');
const opacityMap = loader.load('Modelos/ambientacion/satelite/lambert1_opacity.jpg');
const emissiveMap = loader.load('Modelos/ambientacion/satelite/lambert1_emissive.jpg');
const metalnessMap = loader.load('Modelos/ambientacion/satelite/lambert1_metallic.jpg');

// Crear un material y asignarle las texturas
const texturasatelite = new THREE.MeshStandardMaterial({
    map: baseColor,
    normalMap: normalMap, 
    roughnessMap: roughnessMap, 
    alphaMap: opacityMap, 
    emissiveMap: emissiveMap, 
    metalnessMap: metalnessMap, 
    transparent: true, 
    emissive: new THREE.Color(0xff0000),
    metalness: 1.0, 
    roughness: 0.5 
});

export {texturasatelite};