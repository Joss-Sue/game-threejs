import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const socket = io();

let jugadorNumero = null;
let jugadorNombre = null;

export function esJugador1() {
  return jugadorNumero === 1;
}

export function getJugadorInfo() {
  return { nombre: jugadorNombre, numero: jugadorNumero };
}

// Esta función ahora es async y devuelve una promesa
export async function configurarSocket(asignarRemoto) {
  return new Promise((resolve) => {
    // Obtener sala desde la URL
    const params = new URLSearchParams(window.location.search);
    const sala = params.get('sala');

    socket.on('connect', () => {
      socket.emit('unirse-sala', sala);
    });

    socket.on('info-jugador', ({ nombre, numero }) => {
      jugadorNombre = nombre;
      jugadorNumero = numero;
      resolve(); // ¡Jugador configurado!
    });

    socket.on('estado-remoto', ({ posicion, rotacion }) => {
      if (typeof asignarRemoto === 'function') {
        asignarRemoto(posicion, rotacion);
      }
    });
  });
}

export function enviarEstado(position, quaternion) {
  socket.emit('estadoJugador', {
    posicion: { x: position.x, y: position.y, z: position.z },
    rotacion: {
      _x: quaternion._x,
      _y: quaternion._y,
      _z: quaternion._z,
      _w: quaternion._w
    }
  });
}


