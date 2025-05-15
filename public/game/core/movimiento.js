import * as THREE from 'three';

const teclasPresionadas = { w: false, a: false, s: false, d: false };
const mouse = new THREE.Vector2();

export function setupControles() {
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() in teclasPresionadas) teclasPresionadas[e.key.toLowerCase()] = true;
  });
  document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() in teclasPresionadas) teclasPresionadas[e.key.toLowerCase()] = false;
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
