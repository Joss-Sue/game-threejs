import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import { scene, clock, clock2, clock3, clock4 } from './core/scene.js';
import { camera } from './core/camera.js';
import { cargarPP1 } from './models/pp1.js';
import { cargarPP2 } from './models/pp2.js';
import { cargarEnemy1 } from './models/enemy1.js';
import { cargarEnemigo, actualizarEnemigo } from './models/enemyBase.js';
import { configurarSocket, enviarEstado, esJugador1 } from './core/network.js';
import { setupControles, actualizarMovimiento } from './core/movimiento.js';
import { actualizarEnemigos } from './models/enemyController.js';
import { cargarEscenario } from './models/escenario.js';
import { cargarEnemy2 } from './models/enemy2.js';

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let jugadorLocal = null;
let jugadorRemoto = null;
let estadoRemoto = null;

setupControles();
const params = new URLSearchParams(window.location.search);
const nombreSala = params.get('sala');
const mundo = params.get('mundo');
const nivel = params.get('nivel');
const modo = params.get('modo');

console.log('Sala:', nombreSala);
console.log('Mundo:', mundo);
console.log('Nivel:', nivel);
console.log('Modo:', modo);
async function init() {
  try {
    await configurarSocket((pos, rot) => {
      estadoRemoto = { pos, rot };
    });

    if (esJugador1()) {
      jugadorLocal = await cargarPP1(scene);
      jugadorRemoto = await cargarPP2(scene);
    } else {
      jugadorLocal = await cargarPP2(scene);
      jugadorRemoto = await cargarPP1(scene);
    }
    
    switch (mundo) {
  case 'mundo1':
    scene.background = new THREE.Color(0x87CEEB);
    await cargarEscenario(scene, 'esc1');
    break;
  case 'mundo2':
    scene.background = new THREE.Color(0xFF6347);
    await cargarEscenario(scene, 'esc2');
    break;
  case 'mundo3':
    scene.background = new THREE.Color(0x8A2BE2);
    await cargarEscenario(scene, 'esc3');
    break;
  default:
    // Opcional: algún caso por defecto
    break;
}

    await cargarEscenario(scene, 'esc3');
    //await cargarEnemy1(scene,clock2);
    //await cargarEnemy2(scene,clock3);
    await cargarEnemigo(scene, clock4);


    animate();
  } catch (error) {
    console.error('Error durante la configuración del juego:', error);
  }
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (jugadorLocal) {
    actualizarMovimiento(jugadorLocal, camera, 300, delta);
    enviarEstado(jugadorLocal.position, jugadorLocal.quaternion);
    actualizarCamara(jugadorLocal);
  }

  if (jugadorLocal && jugadorRemoto) {
    actualizarEnemigo([jugadorLocal, jugadorRemoto], clock3);
  } else if (jugadorLocal) {
    actualizarEnemigo([jugadorLocal], clock3);
  }
  if (jugadorRemoto && estadoRemoto) {
    const { pos, rot } = estadoRemoto;
    if (pos && rot) {
      jugadorRemoto.position.set(pos.x, pos.y, pos.z);
      jugadorRemoto.quaternion.set(rot._x, rot._y, rot._z, rot._w);
    }
  }



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


