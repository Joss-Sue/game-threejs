import * as THREE from 'three';

export const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  8000
);
camera.position.set(-7, 1.5, 114);