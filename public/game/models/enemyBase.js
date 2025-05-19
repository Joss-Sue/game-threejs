import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { texturaENEM2 } from '/game/source/Modelos/ENEMIGOS/ENEMY_2/scriptTXT_EN2.js';
import { notificarMuerteEnemigo, enviarDanioJugador } from '../core/network.js';

let enemigo = null;
let mixer = null;
let vida = 100;
let activo = true;

let velocidadBase = 50;
let velocidadActual = velocidadBase;

let tiempoAcumulado = 0;

export function getEnemigo() {
  return enemigo;
}

export function cargarEnemigo(scene, clock, posicion = { x: -80, y: -35, z: -50 }, vidaInicial = 100) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader();

    loader.load('/game/source/Modelos/ENEMIGOS/ENEMY_2/BUG.fbx', (model) => {
      model.traverse((child) => {
        if (child.isMesh) {
          child.material = texturaENEM2;
        }
      });

      model.scale.set(0.3, 0.3, 0.3);
      model.position.set(posicion.x, posicion.y, posicion.z);

      scene.add(model);
      enemigo = model;
      vida = vidaInicial;
      activo = true;
      velocidadActual = velocidadBase;
      tiempoAcumulado = 0;

      loader.load('/game/source/Modelos/ENEMIGOS/ENEMY_2/BUG_WALK.fbx', (anim) => {
        mixer = new THREE.AnimationMixer(enemigo);
        const action = mixer.clipAction(anim.animations[0]);
        action.play();
        resolve();
      }, undefined, reject);
    }, undefined, reject);
  });
}

export function actualizarEnemigo(jugadores, clock) {
  if (!enemigo) return;

  if (!activo) {
    enemigo.visible = false;
    return;
  }

  enemigo.visible = true;

  const delta = clock.getDelta();
  tiempoAcumulado += delta;

  if (mixer) mixer.update(delta);

  // Aumentar velocidad y escala cada segundo
  if (tiempoAcumulado >= 1.0) {
    velocidadActual += 1;

    const nuevaEscalaX = enemigo.scale.x + 0.03;
    const nuevaEscalaY = enemigo.scale.y + 0.03;
    const nuevaEscalaZ = enemigo.scale.z + 0.03;

    enemigo.scale.set(nuevaEscalaX, nuevaEscalaY, nuevaEscalaZ);

    tiempoAcumulado = 0; // reiniciar acumulador
    console.log(`📈 Velocidad: ${velocidadActual.toFixed(2)}, Escala: ${nuevaEscalaX.toFixed(2)}`);
  }

  // Determinar el objetivo según vida
  let objetivo = null;

  // Si hay 2 jugadores
  if (jugadores.length === 2) {
    const jugador1 = jugadores[0];
    const jugador2 = jugadores[1];

    const vida1 = jugador1.vida ?? 0;
    const vida2 = jugador2.vida ?? 0;

    if (vida1 <= 0 && vida2 > 0) {
      objetivo = jugador2;
    } else if (vida2 <= 0 && vida1 > 0) {
      objetivo = jugador1;
    } else {
      // Ambos vivos o ambos muertos (en ese caso elige al más cercano)
      let distanciaMin = enemigo.position.distanceTo(jugador1.position);
      objetivo = jugador1;

      const d2 = enemigo.position.distanceTo(jugador2.position);
      if (d2 < distanciaMin) {
        distanciaMin = d2;
        objetivo = jugador2;
      }
    }
  } else if (jugadores.length === 1) {
    objetivo = jugadores[0];
  } else {
    // No hay jugadores
    return;
  }

  enemigo.lookAt(objetivo.position);
  enemigo.translateZ(velocidadActual * delta);

  // Colisión con jugador
  const distancia = enemigo.position.distanceTo(objetivo.position);
  if (distancia < 60) {
    if (!enemigo._cooldown) {
      const numJugador = objetivo.userData.numero !== undefined ? objetivo.userData.numero : null;

      if (numJugador !== null) {
        enviarDanioJugador(numJugador, 10);
        console.log(`🎯 Jugador ${numJugador} golpeado. Enviando daño al servidor.`);
      } else {
        console.warn('⚠️ El jugador no tiene userData.numero definido');
      }

      enemigo._cooldown = true;
      setTimeout(() => {
        if (enemigo) enemigo._cooldown = false;
      }, 1000);
    }
  }
}


export function aplicarDanioAlEnemigo(scene, danio = 20, id = null) {
  if (!enemigo || !activo) return;

  vida -= danio;
  console.log(`Enemigo golpeado. Vida restante: ${vida}`);

  if (vida <= 0) {
    eliminarEnemigoLocal(scene);
    notificarMuerteEnemigo(id);

    // Respawn después de 5 seg con mayor velocidad
    setTimeout(() => {
      respawnearEnemigo(scene);
    }, 5000);
  }
}

function eliminarEnemigoLocal(scene) {
  activo = false;

  if (enemigo) {
    if (enemigo._cooldown) {
      enemigo._cooldown = false;
    }

    if (mixer) {
      mixer.stopAllAction();
      mixer.uncacheRoot(enemigo);
      mixer = null;
    }

    enemigo.visible = false;
    console.log('🧨 Enemigo "muerto" y detenido (oculto en escena)');
  }
}

function respawnearEnemigo(scene) {
  vida = 1000;
  activo = true;

  velocidadActual += 10;
  tiempoAcumulado = 0;

  console.log(`🔄 Enemigo respawneado con velocidad ${velocidadActual}`);

  if (enemigo) {
    enemigo.visible = true;
    enemigo.position.set(-80, -35, -50);
    enemigo.scale.set(0.3, 0.3, 0.3); // reinicia escala si quieres

    const loader = new FBXLoader();
    loader.load('/game/source/Modelos/ENEMIGOS/ENEMY_2/BUG_WALK.fbx', (anim) => {
      mixer = new THREE.AnimationMixer(enemigo);
      const action = mixer.clipAction(anim.animations[0]);
      action.play();
    });
  }
}

export function eliminarEnemigoRemotamente(id) {
  if (!enemigo) return;

  activo = false;
  enemigo.visible = false;
  console.log(`Enemigo eliminado remotamente (id: ${id})`);
}
