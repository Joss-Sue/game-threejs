import * as THREE from 'three';

const loader= new THREE.TextureLoader();
const baseColor=loader.load('/game/source/Modelos/ESCENARIOS/SKYBOX/GALAXY_BC.jpeg');

const texturaGALAXY = new THREE.MeshStandardMaterial({
    map: baseColor, 
});
const loader2= new THREE.TextureLoader();
const baseColor2=loader2.load('/game/source/Modelos/ESCENARIOS/SKYBOX/sky2.jpg');

const texturaGALAXY2 = new THREE.MeshStandardMaterial({
    map: baseColor2, 
});
const loader3= new THREE.TextureLoader();
const baseColor3=loader3.load('/game/source/Modelos/ESCENARIOS/SKYBOX/sky3.jpg');

const texturaGALAXY3 = new THREE.MeshStandardMaterial({
    map: baseColor3, 
});

export {texturaGALAXY,texturaGALAXY2,texturaGALAXY3};