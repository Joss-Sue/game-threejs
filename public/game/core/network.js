import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";
import {
  aplicarDanioAlEnemigo,
  eliminarEnemigoRemotamente
} from '/game/models/enemyBase.js';

const socket = io();

let jugadorNumero = null;
let jugadorNombre = null;

// Estado interno para controlar si jugador remoto está activo o no
let jugadorRemotoActivo = true;

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

    socket.on('info-jugador', ({ nombre, numero, vidas, enemigo }) => {
      console.log('[Socket] Info jugador recibida:', nombre, numero);
      jugadorNombre = nombre;
      jugadorNumero = numero;

      actualizarUIVidas({ vidas, enemigo });

      if (typeof manejarEstadoVidas === 'function') {
        manejarEstadoVidas({ vidas, enemigo });
      }

      resolve();
    });

    // Actualización estado jugador remoto (posición, rotación y si está activo)
    socket.on('estado-remoto', ({ posicion, rotacion, activo, numero }) => {
      jugadorRemotoActivo = activo;

      if (typeof asignarRemoto === 'function') {
        asignarRemoto(posicion, rotacion, activo);
      }
    });

    socket.on('estado-vidas-actualizado', ({ vidas, enemigo }) => {
      console.log("[DEBUG] Vidas actualizadas:", vidas);
      console.log("[DEBUG] Enemigo actualizado:", enemigo);

      actualizarUIVidas({ vidas, enemigo });

      if (typeof manejarEstadoVidas === 'function') {
        manejarEstadoVidas({ vidas, enemigo });
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
      aplicarDanioAlEnemigo(null, danio, id);
    });

    socket.on('jugadorDesconectado', (numero) => {
      console.warn(`Jugador ${numero} se desconectó.`);
      alert(`Jugador ${numero} se desconectó. Fin de la partida.`);
      window.location.href = '/login.html';
    });
  });
}

function actualizarUIVidas({ vidas, enemigo }) {
  console.log('[DEBUG] Vidas recibidas:', vidas);
  console.log('[DEBUG] Vida enemigo recibida:', enemigo);

  const vidaJ1 = document.getElementById('vida-j1');
  const vidaJ2 = document.getElementById('vida-j2');
  const vidaEnemigo = document.getElementById('vida-enemigo');

  if (!vidaJ1 || !vidaJ2 || !vidaEnemigo) {
    console.warn('[WARN] Uno o más elementos de vidas no existen en el DOM');
    return;
  }

  vidaJ1.innerText = vidas[1];
  vidaJ2.innerText = vidas[2];
  vidaEnemigo.innerText = enemigo.vida;
}

// Actualiza jugador remoto (posición, rotación y visibilidad según "activo")
export function asignarRemoto(posicion, rotacion, activo) {
  if (!activo) {
    if (window.jugadorRemoto) {
      window.jugadorRemoto.visible = false;
      window.jugadorRemoto.userData.activo = false;
    }
    return;
  }

  if (window.jugadorRemoto) {
    window.jugadorRemoto.visible = true;
    window.jugadorRemoto.userData.activo = true;

    window.jugadorRemoto.position.set(posicion.x, posicion.y, posicion.z);
    window.jugadorRemoto.quaternion.set(
      rotacion._x,
      rotacion._y,
      rotacion._z,
      rotacion._w
    );
  }
}

// Emitir muerte enemigo con ID
export function notificarMuerteEnemigo(id) {
  socket.emit('enemigoMuerto', { id });
}

// Emitir daño a enemigo con ID
export function enviarDanioEnemigo(danio, id) {
  socket.emit('danioEnemigo', { danio, id });
}

// Enviar estado del jugador local (posición y rotación)
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

// Enviar daño a jugador PvP
export function enviarDanioJugador(numeroJugador, danio) {
  socket.emit('danioJugador', { numeroJugador, danio });
}
