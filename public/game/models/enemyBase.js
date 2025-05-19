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
  if (mixer) mixer.update(delta);

  // Buscar jugador más cercano
  let objetivo = jugadores[0];
  let distanciaMin = enemigo.position.distanceTo(objetivo.position);

  for (let i = 1; i < jugadores.length; i++) {
    const d = enemigo.position.distanceTo(jugadores[i].position);
    if (d < distanciaMin) {
      distanciaMin = d;
      objetivo = jugadores[i];
    }
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

// Aplica daño localmente y notifica a servidor
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
  vida = 100;
  activo = true;

  velocidadActual += 10;
  console.log(`🔄 Enemigo respawneado con velocidad ${velocidadActual}`);

  if (enemigo) {
    enemigo.visible = true;
    enemigo.position.set(-80, -35, -50);

    // Recrear mixer y animación
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
  if (enemigo) {
    enemigo.visible = false;
  }
  console.log(`Enemigo eliminado remotamente (id: ${id})`);
}
