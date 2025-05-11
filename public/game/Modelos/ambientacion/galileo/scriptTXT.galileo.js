import * as THREE from 'three';

// Cargar las texturas
const loader = new THREE.TextureLoader();
const baseColor = loader.load('Modelos/ambientacion/galileo/textures/Galileo_baseColor.png');
const normalMap = loader.load('Modelos/ambientacion/galileo/textures/Galileo_normal.png');


// Crear un material y asignarle las texturas
const texturagalileo = new THREE.MeshStandardMaterial({
    map: baseColor,
    normalMap: normalMap, 

});


export {texturagalileo};