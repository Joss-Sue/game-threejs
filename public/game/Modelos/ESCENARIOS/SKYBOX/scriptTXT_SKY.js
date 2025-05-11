import * as THREE from 'three';

const loader= new THREE.TextureLoader();
const baseColor=loader.load('Modelos/ESCENARIOS/SKYBOX/GALAXY_BC.jpeg');

const texturaGALAXY = new THREE.MeshStandardMaterial({
    map: baseColor, 
});

export {texturaGALAXY};