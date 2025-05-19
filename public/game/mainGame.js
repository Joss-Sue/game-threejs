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

// Importa la función y material de la orbe con modelo OBJ
import { cargarOrbe } from './models/orbes.js';

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let jugadorLocal = null;
let jugadorRemoto = null;
let estadoRemoto = null;

let vidasJugadores = { 1: 100, 2: 100 };
let estadoEnemigo = { vida: 100, activo: true };

const balas = [];
const orbes = [];  // Array para controlar orbes activas
let orbesRecolectadas = 0; // Contador de orbes recolectadas
let juegoFinalizado = false;

let tiempoRestante =60; // Tiempo inicial en segundos

setupControles();

const limitesMapa = {
  minX: -1500,
  maxX: 1500,
  minZ: -1300,
  maxZ: 1300,
};

function restringirPosicionAlMapa(obj) {
  if (!obj || !obj.position) return;

  const { minX, maxX, minZ, maxZ } = limitesMapa;

  if (obj.position.x < minX) obj.position.x = minX;
  if (obj.position.x > maxX) obj.position.x = maxX;
  if (obj.position.z < minZ) obj.position.z = minZ;
  if (obj.position.z > maxZ) obj.position.z = maxZ;
}

// Función para generar orbes con modelo OBJ y texturas, en posiciones aleatorias
async function generarOrbesRandom(cantidad = 10) {
  const nuevasOrbes = [];
  for (let i = 0; i < cantidad; i++) {
    const x = Math.random() * (limitesMapa.maxX - limitesMapa.minX) + limitesMapa.minX;
    const z = Math.random() * (limitesMapa.maxZ - limitesMapa.minZ) + limitesMapa.minZ;
    const y = 20; // altura para que no estén pegadas al suelo

    // Carga el modelo orbe con su textura
    const orbe = await cargarOrbe([x, y, z], [.05, .05, .05], [0, 0, 0]);
    scene.add(orbe);
    nuevasOrbes.push(orbe);
  }
  return nuevasOrbes;
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

    // Generar orbes con modelo OBJ + textura (inicial)
    const orbesIniciales = await generarOrbesRandom(10);
    orbes.push(...orbesIniciales);

    // Cada 10 segundos generar nuevas orbes y agregarlas
    setInterval(async () => {
      const nuevasOrbes = await generarOrbesRandom(2);
      orbes.push(...nuevasOrbes);
    }, 10000);

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

// Función para detectar colisiones entre orbes y jugador local
function detectarColisionOrbesJugadorLocal() {
  if (!jugadorLocal) return;

  const jugadorBox = new THREE.Box3().setFromObject(jugadorLocal);

  for (let i = orbes.length - 1; i >= 0; i--) {
    const orbe = orbes[i];
    const orbeBox = new THREE.Box3().setFromObject(orbe);

    if (jugadorBox.intersectsBox(orbeBox)) {
      // Colisión detectada, eliminar orbe
      scene.remove(orbe);
      orbes.splice(i, 1);

      // Incrementar contador de orbes recolectadas
      orbesRecolectadas++;
      actualizarHUD();

      console.log('Orbe recolectada!');
    }
  }
}

function actualizarHUD() {
  // Actualiza el HUD en el HTML
  const vidaJ1Elem = document.getElementById('vida-j1');
  const vidaJ2Elem = document.getElementById('vida-j2');
  const vidaEnemigoElem = document.getElementById('vida-enemigo');
  const contadorOrbesElem = document.getElementById('contador-orbes');
  const tiempoRestanteElem = document.getElementById('tiempo-restante');

  if (vidaJ1Elem) vidaJ1Elem.textContent = vidasJugadores[1] ?? 100;
  if (vidaJ2Elem) vidaJ2Elem.textContent = vidasJugadores[2] ?? 100;

  const enemigo = getEnemigo();
  if (vidaEnemigoElem) vidaEnemigoElem.textContent = enemigo?.userData?.vida ?? 100;

  if (contadorOrbesElem) contadorOrbesElem.textContent = orbesRecolectadas;

  if (tiempoRestanteElem) tiempoRestanteElem.textContent = Math.max(0, Math.floor(tiempoRestante));
}

function animate() {
  requestAnimationFrame(animate);
  verificarFinDeJuego();

  const delta = clock.getDelta();

  // Reducir tiempo restante
  if (tiempoRestante > 0) {
    tiempoRestante -= delta;
  }

  if (!juegoFinalizado) {
    if (jugadorLocal && jugadorLocal.vida > 0) {
      actualizarMovimiento(jugadorLocal, camera, 300, delta);
      restringirPosicionAlMapa(jugadorLocal);
      actualizarDisparo(jugadorLocal, scene, balas);
      enviarEstado(jugadorLocal.position, jugadorLocal.quaternion);
      actualizarCamara(jugadorLocal);
    } else if (jugadorLocal) {
      // Actualiza la cámara incluso si el jugador está muerto para no congelar la vista
      actualizarCamara(jugadorLocal);
    }

    // Actualizar enemigo sólo si hay al menos un jugador vivo
    const jugadoresVivos = [jugadorLocal, jugadorRemoto].filter(j => j && j.vida > 0);

    if (jugadoresVivos.length > 0) {
      actualizarEnemigo(jugadoresVivos, clock3);
    }
    
    // Detectar colisión sólo si ambos jugadores existen
    if (jugadorLocal && jugadorRemoto) {
      detectarColisionEntreJugadoresBox(jugadorLocal, jugadorRemoto);
    }
  }

  // Actualizar estado remoto (posición y rotación)
  if (jugadorRemoto && estadoRemoto) {
    const { pos, rot } = estadoRemoto;
    if (pos && rot) {
      jugadorRemoto.position.set(pos.x, pos.y, pos.z);
      jugadorRemoto.quaternion.set(rot._x, rot._y, rot._z, rot._w);
    }
  }

  // Detectar colisión entre orbes y jugador local
  detectarColisionOrbesJugadorLocal();

  // Actualizar balas y colisiones con enemigo
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

  actualizarHUD();

  renderer.render(scene, camera);
}


// Mostrar pantalla de fin de juego cuando se acaba el tiempo
function verificarFinDeJuego() {
  if (tiempoRestante <= 0) {
    mostrarGameOver("⏰ ¡Tiempo agotado!", true); // muestra botón
  }

  if (jugadorLocal?.vida <= 0) {
    mostrarGameOver("😵 ¡Has sido derrotado!", false); // NO muestra botón
  }
  if (jugadorLocal?.vida <= 0 && tiempoRestante<=0) {
    mostrarGameOver("😵 ¡Has sido derrotado!", true); // NO muestra botón
  }

  
}


function mostrarGameOver(mensaje, mostrarBoton = true) {
  const gameOverDiv = document.getElementById('game-over');
  const mensajeFinal = document.getElementById('mensaje-final');
  const botonVolver = document.getElementById('btn-volver');

  if (gameOverDiv && mensajeFinal) {
    mensajeFinal.textContent = mensaje;
    gameOverDiv.style.display = 'block';

    if (botonVolver) {
      botonVolver.style.display = mostrarBoton ? 'inline-block' : 'none';
    }

    // 🛑 Marcar el juego como finalizado
    juegoFinalizado = true;
  }
}



// Manejar botón de volver al menú
const botonVolver = document.getElementById('btn-volver');
if (botonVolver) {
  botonVolver.addEventListener('click', () => {
    window.location.href = 'index.html'; // Cambia si tienes otra ruta al menú
  });
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
