import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import { scene, clock } from './core/scene.js';
import { camera } from './core/camera.js';
import { cargarPP1 } from './models/pp1.js';
import { cargarPP2 } from './models/pp2.js';
import { configurarSocket, enviarEstado, esJugador1 } from './core/network.js';
import { setupControles, actualizarMovimiento } from './core/movimiento.js';
import { actualizarEnemigos } from './models/enemyController.js';
import { cargarEscenario } from './models/escenario.js';

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let jugadorLocal = null;
let jugadorRemoto = null;
let estadoRemoto = null;

setupControles();

async function init() {
  /* await configurarSocket((pos, rot) => {
    estadoRemoto = { pos, rot };
  });

  if (esJugador1()) {
    jugadorLocal = await cargarPP1(scene);
    jugadorRemoto = await cargarPP2(scene);
  } else {
    jugadorLocal = await cargarPP2(scene);
    jugadorRemoto = await cargarPP1(scene);
  } */

  await cargarEscenario(scene, 'esc1');
  animate();
}




function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  /* if (jugadorLocal) {
    actualizarMovimiento(jugadorLocal, camera, 300, delta);
    enviarEstado(jugadorLocal.position, jugadorLocal.quaternion);
    actualizarCamara(jugadorLocal);
  }

  if (jugadorRemoto && estadoRemoto) {
    const { pos, rot } = estadoRemoto;

    if (pos && rot) { 
      jugadorRemoto.position.set(pos.x, pos.y, pos.z);
      jugadorRemoto.quaternion.set(rot._x, rot._y, rot._z, rot._w);
    }
  } */

  renderer.render(scene, camera);
}

const baseOffset = new THREE.Vector3(0, 300, -200);
const offset = new THREE.Vector3();
const tempVec = new THREE.Vector3();
const lookAtVec = new THREE.Vector3();

function actualizarCamara(obj) {
  offset.copy(baseOffset).applyQuaternion(obj.quaternion);
  tempVec.copy(obj.position).add(offset);
  camera.position.lerp(tempVec, 0.1);

  lookAtVec.copy(obj.position).add(new THREE.Vector3(0, 50, 0));
  camera.lookAt(lookAtVec);
}

init();

