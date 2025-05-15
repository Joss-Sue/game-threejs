import * as THREE from 'three';

export const scene = new THREE.Scene();
export const clock = new THREE.Clock();

// === LUCES ===

// Luz ambiental (ilumina todo suavemente)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Luz direccional simulando el sol
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.position.set(100, 300, 100);
sunLight.castShadow = true;

sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;

sunLight.shadow.camera.left = -500;
sunLight.shadow.camera.right = 500;
sunLight.shadow.camera.top = 500;
sunLight.shadow.camera.bottom = -500;
sunLight.shadow.camera.far = 1000;

scene.add(sunLight);

// Luz hemisférica para rellenar sombras
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
hemiLight.position.set(0, 200, 0);
scene.add(hemiLight);
