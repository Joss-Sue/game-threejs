const jugadoresPorSala = {};

function configurarJuegoSockets(io, socket, user, sala) {
  if (!jugadoresPorSala[sala]) {
    jugadoresPorSala[sala] = {
      jugadores: {},
      numerosDisponibles: [1, 2],
    };
  }

  const salaData = jugadoresPorSala[sala];

  if (salaData.numerosDisponibles.length === 0) {
    socket.emit('salaLlena');
    return;
  }

  const numeroJugador = salaData.numerosDisponibles.shift();

  salaData.jugadores[socket.id] = {
    id: socket.id,
    nombre: user.nombre,
    numero: numeroJugador,
    posicion: null,
    rotacion: null,
  };

  socket.emit('info-jugador', {
    id: socket.id,
    nombre: user.nombre,
    numero: numeroJugador,
  });

  const jugadores = Object.values(salaData.jugadores).map(j => ({
    id: j.id,
    nombre: j.nombre,
    numero: j.numero,
  }));

  io.to(sala).emit('jugadores-actualizados', jugadores);

  socket.on('estadoJugador', (estado) => {
    const jugador = salaData.jugadores[socket.id];
    if (jugador) {
      jugador.posicion = estado.posicion;
      jugador.rotacion = estado.rotacion;

      socket.to(sala).emit('estado-remoto', {
        id: socket.id,
        numero: jugador.numero,
        posicion: estado.posicion,
        rotacion: estado.rotacion
      });
    }
  });

  socket.on('disconnect', () => {
    const jugador = salaData.jugadores[socket.id];
    if (!jugador) return;

    delete salaData.jugadores[socket.id];
    salaData.numerosDisponibles.push(jugador.numero);

    socket.to(sala).emit('jugadorDesconectado', jugador.numero);

    if (Object.keys(salaData.jugadores).length === 0) {
      delete jugadoresPorSala[sala];
    } else {
      const jugadoresRestantes = Object.values(salaData.jugadores).map(j => ({
        id: j.id,
        nombre: j.nombre,
        numero: j.numero,
      }));
      io.to(sala).emit('jugadores-actualizados', jugadoresRestantes);
    }
  });
}

export default configurarJuegoSockets;



