const jugadoresPorSala = {};

function configurarJuegoSockets(io, socket, user) {
  socket.on('unirse-sala', (sala) => {
    socket.join(sala);

    if (!jugadoresPorSala[sala]) {
      jugadoresPorSala[sala] = {};
    }

    const socketsEnSala = io.sockets.adapter.rooms.get(sala);
    const numeroJugador = socketsEnSala.size; // 1 o 2

    socket.emit('info-jugador', { nombre: user.nombre, numero: numeroJugador });

    jugadoresPorSala[sala][socket.id] = {
      nombre: user.nombre,
      posicion: null,
      rotacion: null,
    };

    // Escuchar estado del jugador y reenviar a los demás
    socket.on('estadoJugador', (estado) => {
      jugadoresPorSala[sala][socket.id].posicion = estado.posicion;
      jugadoresPorSala[sala][socket.id].rotacion = estado.rotacion;

      socket.to(sala).emit('estado-remoto', {
        id: socket.id,
        ...estado,
      });
    });

    socket.on('disconnect', () => {
      delete jugadoresPorSala[sala][socket.id];

      // Elimina la sala si ya no quedan jugadores
      if (Object.keys(jugadoresPorSala[sala]).length === 0) {
        delete jugadoresPorSala[sala];
      }
    });
  });
}

export default configurarJuegoSockets;

