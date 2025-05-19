// mainGame.js
import * as THREE from 'three';
import { WebGLRenderer } from 'three';
import { scene, clock, clock3, clock4 } from './core/scene.js';
import { camera } from './core/camera.js';
import { cargarPP1 } from './models/pp1.js';
import { cargarPP2 } from './models/pp2.js';
import {
  cargarEnemigo,
  actualizarEnemigo,
  aplicarDanioAlEnemigo,
  getEnemigo,
} from './models/enemyBase.js';

import {
  configurarSocket,
  enviarEstado,
  esJugador1,
  notificarMuerteEnemigo,
  enviarDanioJugador,
  enviarDanioEnemigo,
} from './core/network.js';

import {
  setupControles,
  actualizarMovimiento,
  actualizarDisparo,
} from './core/movimiento.js';

import { cargarEscenario } from './models/escenario.js';

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let jugadorLocal = null;
let jugadorRemoto = null;
let estadoRemoto = null;

// Mantener vidas sincronizadas
let vidasJugadores = { 1: 100, 2: 100 };
let estadoEnemigo = { vida: 100, activo: true };

const balas = []; // Guardar balas disparadas

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
    await configurarSocket(
      (pos, rot) => {
        // Actualizar estado remoto de posición y rotación
        estadoRemoto = { pos, rot };
      },
      (estadoVidas) => {
        // Actualizar las vidas de jugadores y enemigo cuando llegan del servidor
        if (estadoVidas.vidas) {
          vidasJugadores = { ...vidasJugadores, ...estadoVidas.vidas };
        }
        if (estadoVidas.enemigo) {
          estadoEnemigo = { ...estadoEnemigo, ...estadoVidas.enemigo };
          if (!estadoEnemigo.activo) {
            const enemigo = getEnemigo();
            if (enemigo) {
              scene.remove(enemigo);
              console.log('Enemigo eliminado por sincronización remota');
            }
          }
        }

        // Actualizar vidas visuales en los objetos 3D
        if (jugadorLocal && vidasJugadores[jugadorLocal.userData.numero] !== undefined) {
          jugadorLocal.vida = vidasJugadores[jugadorLocal.userData.numero];
        }
        if (jugadorRemoto && vidasJugadores[jugadorRemoto.userData.numero] !== undefined) {
          jugadorRemoto.vida = vidasJugadores[jugadorRemoto.userData.numero];
        }
        const enemigo = getEnemigo();
        if (enemigo) {
          enemigo.userData.vida = estadoEnemigo.vida;
        }
      },
      () => {
        // Manejar muerte enemigo
        const enemigo = getEnemigo();
        if (enemigo) {
          scene.remove(enemigo);
          estadoEnemigo.activo = false;
          console.log('Enemigo eliminado por notificación remota');
        }
      }
    );

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

    jugadorLocal.vida = 100;
    jugadorLocal.userData.numero = esJugador1() ? 1 : 2;
    jugadorRemoto.vida = 100;
    jugadorRemoto.userData.numero = esJugador1() ? 2 : 1;

    await cargarEscenario(scene, 'esc3');
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
    actualizarDisparo(jugadorLocal, scene, balas);
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

  for (let i = balas.length - 1; i >= 0; i--) {
    const bala = balas[i];
    bala.mesh.position.add(
      bala.direccion.clone().multiplyScalar(bala.velocidad * delta)
    );
    bala.tiempo -= delta;

    const enemigo = getEnemigo();
    if (enemigo) {
      const distancia = bala.mesh.position.distanceTo(enemigo.position);
      if (distancia < 20) {
        aplicarDanioAlEnemigo(scene, 20);
        enviarDanioEnemigo(20); // Enviar daño al servidor para sincronización
        scene.remove(bala.mesh);
        balas.splice(i, 1);

        if (enemigo.userData.vida <= 0) {
          notificarMuerteEnemigo();
        }

        continue;
      }
    }

    if (bala.tiempo <= 0) {
      scene.remove(bala.mesh);
      balas.splice(i, 1);
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

// Ejemplo: función para cuando un jugador recibe daño (ejemplo de llamada)
function cuandoRecibesDanio(numeroJugador, danio) {
  if (jugadorLocal && jugadorLocal.userData.numero === numeroJugador) {
    jugadorLocal.vida -= danio;
    if (jugadorLocal.vida < 0) jugadorLocal.vida = 0;
  }
}

// Evento para manejar daño recibido (deberías escucharlo en tu red)
// Aquí tienes que añadir en configurarSocket algo así para recibir daños a jugador
// socket.on('danioJugador', ({ numeroJugador, danio }) => { ... })

init();
