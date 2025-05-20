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

import { cargarOrbe } from './models/orbes.js';

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let jugadorLocal = null;
let jugadorRemoto = null;
let estadoRemoto = null;

let vidasJugadores = { 1: 1000, 2: 100 };
let estadoEnemigo = { vida: 1000, activo: true };

const balas = [];
const orbes = [];  
let orbesRecolectadas = 0; 
let juegoFinalizado = false;
let tiempoRestante ;
let danioEnemigoModo;
let danioHaciaJugador;
let regenerarVida;
let cantidadOrbes; 



setupControles();
const params = new URLSearchParams(window.location.search);
const nombreSala = params.get('sala');
const mundo = params.get('mundo');
const nivel = params.get('nivel');
const modo = params.get('modo');

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

function restringirPosicionAlMapa(obj) {
  if (!obj || !obj.position) return;

  const { minX, maxX, minZ, maxZ } = limitesMapa;

  if (obj.position.x < minX) obj.position.x = minX;
  if (obj.position.x > maxX) obj.position.x = maxX;
  if (obj.position.z < minZ) obj.position.z = minZ;
  if (obj.position.z > maxZ) obj.position.z = maxZ;
}

async function generarOrbesRandom(cantidad) {
  const nuevasOrbes = [];
  for (let i = 0; i < cantidad; i++) {
    const x = Math.random() * (limitesMapa.maxX - limitesMapa.minX) + limitesMapa.minX;
    const z = Math.random() * (limitesMapa.maxZ - limitesMapa.minZ) + limitesMapa.minZ;
    const y = 20; 

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
        break;
    }

    jugadorLocal.vida = 100;
    jugadorLocal.userData.numero = esJugador1() ? 1 : 2;
    jugadorRemoto.vida = 100;
    jugadorRemoto.userData.numero = esJugador1() ? 2 : 1;

    await cargarEnemigo(scene, clock4, { x: 200, y: 300, z: 20 }, 1000);
    agregarParedesDelMapa();

    if (nivel =='facil') {
      cantidadOrbes = 10;
      tiempoRestante = 90;
      danioEnemigoModo=50;
      danioHaciaJugador=10;
      regenerarVida=20;
      console.log("facil");
    } else if (nivel == 'dificil') {
      cantidadOrbes = 2;
      tiempoRestante = 40;
      danioEnemigoModo=20;
      danioHaciaJugador=25;
      regenerarVida=5;
      console.log("dif");
    }
    const orbesIniciales = await generarOrbesRandom(cantidadOrbes);
    orbes.push(...orbesIniciales);
    setInterval(async () => {
      const nuevasOrbes = await generarOrbesRandom(cantidadOrbes/2);
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

function detectarColisionOrbesJugadorLocal() {
  if (!jugadorLocal) return;
  const jugadorBox = new THREE.Box3().setFromObject(jugadorLocal);
  for (let i = orbes.length - 1; i >= 0; i--) {
    const orbe = orbes[i];
    const orbeBox = new THREE.Box3().setFromObject(orbe);
    if (jugadorBox.intersectsBox(orbeBox)) {
      const numJugador = jugadorLocal.userData.numero !== undefined ? jugadorLocal.userData.numero : null;
      if (numJugador !== null) {
        enviarDanioJugador(numJugador, regenerarVida,1); 
        console.log(`💥 Bala impactó al jugador remoto ${numJugador}`);
      } else {
        console.warn('⚠️ El jugador remoto no tiene userData.numero definido');
      }
      scene.remove(orbe);
      orbes.splice(i, 1);
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
      actualizarCamara(jugadorLocal);
    }

    const jugadoresVivos = [jugadorLocal, jugadorRemoto].filter(j => j && j.vida > 0);
    if (jugadoresVivos.length > 0) {
      actualizarEnemigo(jugadoresVivos, clock3);
    }
    if (jugadorLocal && jugadorRemoto) {
      detectarColisionEntreJugadoresBox(jugadorLocal, jugadorRemoto);
    }
  }
  if (jugadorRemoto && estadoRemoto) {
    const { pos, rot } = estadoRemoto;
    if (pos && rot) {
      jugadorRemoto.position.set(pos.x, pos.y, pos.z);
      jugadorRemoto.quaternion.set(rot._x, rot._y, rot._z, rot._w);
    }
  }

  detectarColisionOrbesJugadorLocal();
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
      aplicarDanioAlEnemigo(scene, danioEnemigoModo);
      enviarDanioEnemigo(danioEnemigoModo);
      scene.remove(bala.mesh);
      balas.splice(i, 1);

      if (enemigo.userData.vida <= 0) {
        notificarMuerteEnemigo();
      }
      continue;
    }
  }
  if(modo=="versus"){
    if (jugadorRemoto) {
    const distanciaJugador = bala.mesh.position.distanceTo(jugadorRemoto.position);
    if (distanciaJugador < 20) { 
      const numJugador = jugadorRemoto.userData.numero !== undefined ? jugadorRemoto.userData.numero : null;

      if (numJugador !== null) {
        enviarDanioJugador(numJugador, danioHaciaJugador,0); 
        console.log(`💥 Bala impactó al jugador remoto ${numJugador}`);
      } else {
        console.warn('⚠️ El jugador remoto no tiene userData.numero definido');
      }
      scene.remove(bala.mesh);
      balas.splice(i, 1);
      continue; 
    }
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

function verificarFinDeJuego() {
  if (tiempoRestante <= 0) {
    mostrarGameOver("⏰ ¡Tiempo agotado!", true); 
  }
  if (jugadorLocal?.vida <= 0) {
    mostrarGameOver("😵 ¡Has sido derrotado!", false); 
  }
  if (jugadorLocal?.vida <= 0 && tiempoRestante<=0) {
    mostrarGameOver("😵 ¡Has sido derrotado!", true); 
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

    juegoFinalizado = true;
  }
}

const botonVolver = document.getElementById('btn-volver');
if (botonVolver) {
  botonVolver.addEventListener('click', () => {
    window.location.href = '/index.html'; 
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
