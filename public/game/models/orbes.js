import * as THREE from 'three';
import { notificarRecoleccionOrbe } from '../core/network.js';

let orbes = [];
let puntuacionGlobal = 0;

export function crearOrbes(scene, posiciones) {
  const geometria = new THREE.SphereGeometry(5, 32, 32);
  // Usamos material clon para que cada orbe tenga su propia instancia
  posiciones.forEach((pos, index) => {
    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1,
    });
    const orbe = new THREE.Mesh(geometria, material);
    orbe.position.set(pos.x, pos.y, pos.z);
    orbe.name = `orbe_${index}`;
    scene.add(orbe);
    orbes.push(orbe);
  });
}

export function actualizarOrbes(scene, jugador) {
  orbes = orbes.filter((orbe) => {
    const distancia = orbe.position.distanceTo(jugador.position);
    if (distancia < 10) {
      scene.remove(orbe);
      if (orbe.geometry) orbe.geometry.dispose();
      if (orbe.material) orbe.material.dispose();
      puntuacionGlobal += 1;
      console.log(`🎯 Orbe recolectada. Puntuación global: ${puntuacionGlobal}`);
      notificarRecoleccionOrbe(orbe.name);
      return false;
    }
    return true;
  });
}

export function eliminarOrbePorNombre(scene, nombre) {
  const orbe = scene.getObjectByName(nombre);
  if (orbe) {
    scene.remove(orbe);
    if (orbe.geometry) orbe.geometry.dispose();
    if (orbe.material) orbe.material.dispose();
    orbes = orbes.filter((o) => o.name !== nombre);
    puntuacionGlobal += 1;
    console.log(`🎯 Orbe recolectada remotamente. Puntuación global: ${puntuacionGlobal}`);
  }
}

export function obtenerPuntuacionGlobal() {
  return puntuacionGlobal;
}
