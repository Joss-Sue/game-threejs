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

// Configura socket y espera info del jugador
export async function configurarSocket(asignarRemoto) {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams(window.location.search);
    const sala = params.get('sala');

    console.log('[Socket] Sala desde URL:', sala);

    socket.on('connect', () => {
      console.log('[Socket] Conectado al servidor');
      socket.emit('joinRoom', sala);
    });

    socket.on('salaLlena', () => {
      alert('La sala ya tiene 2 jugadores. Redirigiendo al lobby...');
      window.location.href = '/salas.html'; // O como se llame tu vista
      reject(new Error('Sala llena'));
    });

    socket.on('roomJoined', (roomName) => {
      console.log(`[Socket] Unido a sala: ${roomName}`);
      socket.emit('iniciarJuego', roomName);
    });

    socket.on('info-jugador', ({ nombre, numero }) => {
      console.log('[Socket] Info jugador recibida:', nombre, numero);
      jugadorNombre = nombre;
      jugadorNumero = numero;
      resolve(); // Continúa init()
    });

    socket.on('estado-remoto', ({ posicion, rotacion }) => {
      if (typeof asignarRemoto === 'function') {
        asignarRemoto(posicion, rotacion);
      }
    });

    socket.on('jugadorDesconectado', (numero) => {
      console.warn(`Jugador ${numero} se desconectó.`);
      alert(`Jugador ${numero} se desconectó. Fin de la partida.`);
      window.location.href = '/login.html';
    });
  });
}

export function enviarEstado(position, quaternion) {
  socket.emit('estadoJugador', {
    posicion: {
      x: position.x,
      y: position.y,
      z: position.z,
    },
    rotacion: {
      _x: quaternion._x,
      _y: quaternion._y,
      _z: quaternion._z,
      _w: quaternion._w,
    },
  });
}




