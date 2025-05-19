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

let vidasJugadores = { 1: 100, 2: 100 };
let estadoEnemigo = { vida: 100, activo: true };

const balas = [];

setupControles();

export function iniciarMusicaFondo() {
  if (!window.musicaFondo) {
    const audio = new Audio('/game/audio/planckx27s-constant-la-constante-de-planck-127554.mp3');
    audio.loop = true;

    // Leer volumen guardado desde localStorage (o por defecto 0.5)
    let volumenGuardado = parseFloat(localStorage.getItem('volumenMusica')) || 0.5;

    // Asegurarse de que el volumen esté en el rango adecuado (0-1)
    volumenGuardado = Math.max(0, Math.min(1, volumenGuardado));

    audio.volume = volumenGuardado;

    window.musicaFondo = audio;

    // Reproducir tras primer interacción
    const reproducir = () => {
      audio.play().catch(err => console.warn('No se pudo reproducir audio:', err));
      document.removeEventListener('click', reproducir);
      document.removeEventListener('touchstart', reproducir);
    };

    document.addEventListener('click', reproducir);
    document.addEventListener('touchstart', reproducir);
  }
}



// Límites del mapa cuadrado
const limitesMapa = {
  minX: -1500,
  maxX: 1500,
  minZ: -1300,
  maxZ: 1300,
};

// Restricción del jugador a los límites
function restringirPosicionAlMapa(obj) {
  if (!obj || !obj.position) return;

  const { minX, maxX, minZ, maxZ } = limitesMapa;

  if (obj.position.x < minX) obj.position.x = minX;
  if (obj.position.x > maxX) obj.position.x = maxX;
  if (obj.position.z < minZ) obj.position.z = minZ;
  if (obj.position.z > maxZ) obj.position.z = maxZ;
}

async function init() {
  try {
    await configurarSocket(
      (pos, rot) => {
        estadoRemoto = { pos, rot };
      },
      (estadoVidas) => {
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

    jugadorLocal.vida = 100;
    jugadorLocal.userData.numero = esJugador1() ? 1 : 2;
    jugadorRemoto.vida = 100;
    jugadorRemoto.userData.numero = esJugador1() ? 2 : 1;

    await cargarEscenario(scene, 'esc3');
    await cargarEnemigo(scene, clock4);

    agregarParedesDelMapa();

    animate();
  } catch (error) {
    console.error('Error durante la configuración del juego:', error);
  }
}

function agregarParedesDelMapa() {
  const alturaPared = 200;
  const espesor = 10;
  const ancho = limitesMapa.maxX - limitesMapa.minX + espesor;
  const profundidad = limitesMapa.maxZ - limitesMapa.minZ + espesor;

  const materialInvisible = new THREE.MeshBasicMaterial({ visible: false });

  const paredFrontal = new THREE.Mesh(
    new THREE.BoxGeometry(ancho, alturaPared, espesor),
    materialInvisible
  );
  paredFrontal.position.set(0, alturaPared / 2, limitesMapa.maxZ + espesor / 2);
  scene.add(paredFrontal);

  const paredTrasera = new THREE.Mesh(
    new THREE.BoxGeometry(ancho, alturaPared, espesor),
    materialInvisible
  );
  paredTrasera.position.set(0, alturaPared / 2, limitesMapa.minZ - espesor / 2);
  scene.add(paredTrasera);

  const paredIzquierda = new THREE.Mesh(
    new THREE.BoxGeometry(espesor, alturaPared, profundidad),
    materialInvisible
  );
  paredIzquierda.position.set(limitesMapa.minX - espesor / 2, alturaPared / 2, 0);
  scene.add(paredIzquierda);

  const paredDerecha = new THREE.Mesh(
    new THREE.BoxGeometry(espesor, alturaPared, profundidad),
    materialInvisible
  );
  paredDerecha.position.set(limitesMapa.maxX + espesor / 2, alturaPared / 2, 0);
  scene.add(paredDerecha);
}


function detectarColisionEntreJugadoresBox(jugadorA, jugadorB) {
  if (!jugadorA || !jugadorB) return;

  const boxA = new THREE.Box3().setFromObject(jugadorA);
  const boxB = new THREE.Box3().setFromObject(jugadorB);

  if (boxA.intersectsBox(boxB)) {
    console.log('¡Colisión entre pp1 y pp2!');

    const direccion = new THREE.Vector3().subVectors(jugadorA.position, jugadorB.position).normalize();
    const correccion = direccion.multiplyScalar(10);
    jugadorA.position.add(correccion);
    jugadorB.position.sub(correccion);
  }
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  if (jugadorLocal) {
    actualizarMovimiento(jugadorLocal, camera, 300, delta);
    restringirPosicionAlMapa(jugadorLocal); // <<--- aquí restringimos movimiento
    actualizarDisparo(jugadorLocal, scene, balas);
    enviarEstado(jugadorLocal.position, jugadorLocal.quaternion);
    actualizarCamara(jugadorLocal);
  }

  if (jugadorLocal && jugadorRemoto) {
    detectarColisionEntreJugadoresBox(jugadorLocal, jugadorRemoto);
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
        enviarDanioEnemigo(20);
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

function cuandoRecibesDanio(numeroJugador, danio) {
  if (jugadorLocal && jugadorLocal.userData.numero === numeroJugador) {
    jugadorLocal.vida -= danio;
    if (jugadorLocal.vida < 0) jugadorLocal.vida = 0;
  }
}

init();
