import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";
import {
  aplicarDanioAlEnemigo,
  eliminarEnemigoRemotamente
} from '/game/models/enemyBase.js';

const socket = io();

let jugadorNumero = null;
let jugadorNombre = null;

export function esJugador1() {
  return jugadorNumero === 1;
}

export function getJugadorInfo() {
  return { nombre: jugadorNombre, numero: jugadorNumero };
}

export async function configurarSocket(asignarRemoto, manejarEstadoVidas, manejarMuerteEnemigo) {
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
      window.location.href = '/salas.html';
      reject(new Error('Sala llena'));
    });

    socket.on('roomJoined', (roomName) => {
      console.log(`[Socket] Unido a sala: ${roomName}`);
      socket.emit('iniciarJuego', roomName);
    });

    socket.on('info-jugador', ({ nombre, numero, vidas, enemigos }) => {
      console.log('[Socket] Info jugador recibida:', nombre, numero);
      jugadorNombre = nombre;
      jugadorNumero = numero;

      if (typeof manejarEstadoVidas === 'function') {
        manejarEstadoVidas({ vidas, enemigos });
      }

      resolve();
    });

    socket.on('estado-remoto', ({ posicion, rotacion }) => {
      if (typeof asignarRemoto === 'function') {
        asignarRemoto(posicion, rotacion);
      }
    });

    socket.on('estado-vidas-actualizado', (estado) => {
      if (typeof manejarEstadoVidas === 'function') {
        manejarEstadoVidas(estado);
      }
    });

    socket.on('enemigoMuerto', ({ id }) => {
      console.log(`[Socket] Enemigo muerto recibido (id: ${id})`);
      eliminarEnemigoRemotamente(id);
      if (typeof manejarMuerteEnemigo === 'function') {
        manejarMuerteEnemigo(id);
      }
    });

    socket.on('danioEnemigo', ({ danio, id }) => {
      console.log(`[Socket] Daño recibido para enemigo ${id}: ${danio}`);
      aplicarDanioAlEnemigo(null, danio, id); // `scene` se ignora, ya se maneja dentro de enemyBase
    });

    socket.on('jugadorDesconectado', (numero) => {
      console.warn(`Jugador ${numero} se desconectó.`);
      alert(`Jugador ${numero} se desconectó. Fin de la partida.`);
      window.location.href = '/lobby';
    });
  });
}

// ✅ Notificar que un enemigo murió (se especifica el ID)
export function notificarMuerteEnemigo(id) {
  socket.emit('enemigoMuerto', { id });
}

// ✅ Enviar daño al enemigo (también se envía el ID)
export function enviarDanioEnemigo(danio, id) {
  socket.emit('danioEnemigo', { danio, id });
}

// ✅ Enviar estado del jugador local
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

// ✅ Enviar daño a un jugador específico (PvP)
export function enviarDanioJugador(numeroJugador, danio) {
  socket.emit('danioJugador', { numeroJugador, danio });
}
