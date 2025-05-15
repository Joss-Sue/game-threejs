const jugadoresPorSala = {};

function configurarJuegoSockets(io, socket, user) {
  socket.on('unirse-sala', (sala) => {
    socket.join(sala);

    if (!jugadoresPorSala[sala]) {
      jugadoresPorSala[sala] = {};
    }

    const jugadores = jugadoresPorSala[sala];

    // Asignar número de jugador disponible (1 o 2)
    const numeroJugador = Object.values(jugadores).some(j => j.numero === 1) ? 2 : 1;

    jugadores[socket.id] = {
      id: socket.id,
      nombre: user.nombre,
      numero: numeroJugador,
      posicion: null,
      rotacion: null,
    };

    // Notificar al jugador actual su número
    socket.emit('info-jugador', {
      id: socket.id,
      nombre: user.nombre,
      numero: numeroJugador,
    });

    // Enviar a todos los jugadores de la sala la lista de jugadores actual
    const listaJugadores = Object.values(jugadores).map(j => ({
      id: j.id,
      nombre: j.nombre,
      numero: j.numero
    }));

    io.to(sala).emit('jugadores-actualizados', listaJugadores);

    // Sincronizar estado de cada jugador
    socket.on('estadoJugador', (estado) => {
      jugadores[socket.id].posicion = estado.posicion;
      jugadores[socket.id].rotacion = estado.rotacion;

      socket.to(sala).emit('estado-remoto', {
        id: socket.id,
        numero: jugadores[socket.id].numero,
        posicion: estado.posicion,
        rotacion: estado.rotacion
      });
    });

    socket.on('disconnect', () => {
      delete jugadores[socket.id];

      if (Object.keys(jugadores).length === 0) {
        delete jugadoresPorSala[sala];
      } else {
        // Notificar a los demás que un jugador se fue
        const listaActualizada = Object.values(jugadores).map(j => ({
          id: j.id,
          nombre: j.nombre,
          numero: j.numero
        }));
        io.to(sala).emit('jugadores-actualizados', listaActualizada);
      }
    });
  });
}

export default configurarJuegoSockets;

