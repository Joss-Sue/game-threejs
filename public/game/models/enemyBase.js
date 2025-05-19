import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { texturaENEM2 } from '/game/source/Modelos/ENEMIGOS/ENEMY_2/scriptTXT_EN2.js';
import { notificarMuerteEnemigo } from '../core/network.js';

let enemigo = null;
let mixer = null;
let vida = 100;
let activo = true;

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

      loader.load('/game/source/Modelos/ENEMIGOS/ENEMY_2/BUG_WALK.fbx', (anim) => {
        mixer = new THREE.AnimationMixer(enemigo);
        const action = mixer.clipAction(anim.animations[0]);
        action.play();
        resolve();
      }, undefined, reject);
    }, undefined, reject);
  });
}

export function actualizarEnemigo(jugadores, clock, velocidad = 50) {
  if (!enemigo || !activo || jugadores.length === 0) return;

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
  enemigo.translateZ(velocidad * delta);

  // Colisión con jugador
  const distancia = enemigo.position.distanceTo(objetivo.position);
  if (distancia < 60) {
    if (!enemigo._cooldown) {
      objetivo.vida = Math.max(0, objetivo.vida - 10);

      const numJugador = objetivo.userData.numero !== undefined ? objetivo.userData.numero : '?';
      console.log(`🎯 Jugador ${numJugador} golpeado. Vida restante: ${objetivo.vida}`);

      enemigo._cooldown = true;

      setTimeout(() => {
        if (enemigo) enemigo._cooldown = false;
      }, 1000);
    }
  }
}

export function aplicarDanioAlEnemigo(scene, danio = 20) {
  if (!enemigo || !activo) return;

  vida -= danio;
  console.log(`Enemigo golpeado. Vida restante: ${vida}`);

  if (vida <= 0) {
    eliminarEnemigoLocal(scene);
    notificarMuerteEnemigo(); // ← Avisar al otro cliente
  }
}

function eliminarEnemigoLocal(scene) {
  activo = false;

  if (enemigo) {
    if (enemigo._cooldown) {
      enemigo._cooldown = false;
    }

    if (enemigo.parent) {
      enemigo.parent.remove(enemigo);
    }

    if (mixer) {
      mixer.stopAllAction();
      mixer.uncacheRoot(enemigo);
      mixer = null;
    }

    enemigo = null;

    console.log('🧨 Enemigo eliminado');
  }
}

export function eliminarEnemigoRemotamente() {
  if (!enemigo || !activo) return;

  console.log('Enemigo eliminado por sincronización remota');
  eliminarEnemigoLocal(enemigo.parent || { remove: () => {} }); // seguridad por si no tiene parent
}

export function resetEnemigo(scene, vidaInicial = 100) {
  vida = vidaInicial;
  activo = true;
  if (enemigo && !scene.children.includes(enemigo)) {
    scene.add(enemigo);
  }
}
