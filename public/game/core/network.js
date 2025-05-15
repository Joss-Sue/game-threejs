import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const socket = io();

let jugadorNumero = null;
let jugadorNombre = null;

export function configurarSocket(asignarRemoto) {
  return new Promise((resolve) => {
    socket.on('connect', () => {
      socket.emit('obtener-info-jugador');
      socket.emit('unirse-sala', 'sala1');
    });

    socket.on('info-jugador', ({ nombre, numero }) => {
      jugadorNombre = nombre;
      jugadorNumero = numero;
      resolve(); // Ya sabemos quién es el jugador, podemos continuar
    });

    socket.on('estado-remoto', ({ position, rotation }) => {
      if (!asignarRemoto) return;
      asignarRemoto(position, rotation);
    });
  });
}

// Emitir datos planos: x,y,z y quaternion _x,_y,_z,_w
export function enviarEstado(position, quaternion) {
  socket.emit('estadoJugador', {
    position: { x: position.x, y: position.y, z: position.z },
    rotation: { _x: quaternion._x, _y: quaternion._y, _z: quaternion._z, _w: quaternion._w }
  });
}

export function esJugador1() {
  return jugadorNumero === 1;
}

