import * as THREE from 'three';

const teclasPresionadas = { w: false, a: false, s: false, d: false, e: false };
const mouse = new THREE.Vector2();
let puedeDisparar = true;

export function setupControles() {
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in teclasPresionadas) teclasPresionadas[key] = true;
  });

  document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in teclasPresionadas) teclasPresionadas[key] = false;
  });

  document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
}

export function actualizarMovimiento(jugador, camera, velocidad = 300, delta) {
  const input = new THREE.Vector3(
    (teclasPresionadas.a ? 1 : 0) - (teclasPresionadas.d ? 1 : 0),
    0,
    (teclasPresionadas.w ? 1 : 0) - (teclasPresionadas.s ? 1 : 0)
  );

  if (input.lengthSq() > 0) {
    input.normalize();
    const dirMov = input.applyQuaternion(jugador.quaternion);
    jugador.position.add(dirMov.multiplyScalar(velocidad * delta));
  }

  const mouseVector = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera);
  const dir = mouseVector.sub(camera.position).normalize();
  const dist = (jugador.position.y - camera.position.y) / dir.y;
  const point = camera.position.clone().add(dir.multiplyScalar(dist));

  const direccion = point.clone().sub(jugador.position);
  direccion.y = 0;
  direccion.normalize();

  const rotY = Math.atan2(direccion.x, direccion.z);
  const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
  jugador.quaternion.slerp(quaternion, 0.1);
}

export function actualizarDisparo(jugador, scene, balas) {
  if (teclasPresionadas.e && puedeDisparar) {
    puedeDisparar = false;

    const geometria = new THREE.SphereGeometry(5, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x00ffff, // Turquesa brillante
      emissiveIntensity: 2,
      metalness: 0.3,
      roughness: 0.4
    });

    const bala = new THREE.Mesh(geometria, material);
    bala.position.copy(jugador.position);
    scene.add(bala);

    const direccion = new THREE.Vector3(0, 0, 1).applyQuaternion(jugador.quaternion).normalize();

    balas.push({
      mesh: bala,
      direccion: direccion,
      velocidad: 500,
      tiempo: 5
    });

    // Cooldown para disparo
    setTimeout(() => {
      puedeDisparar = true;
    }, 300); // 300ms entre disparos
  }
}
