import { getSala, addJugador, removeJugador, updateEstadoJugador } from '../utils/jugadorManager.js';

const handleGameEvents = (io, socket, user) => {
  socket.on('iniciarJuego', (roomName) => {
    const resultado = addJugador(roomName, socket.id, user.nombre);
    if (!resultado) {
      socket.emit('salaLlena');
      return;
    }

    socket.emit('info-jugador', resultado.jugador);
    io.to(roomName).emit('jugadores-actualizados', resultado.jugadores);

    socket.on('estadoJugador', (estado) => {
      const data = updateEstadoJugador(roomName, socket.id, estado);
      if (data) {
        socket.to(roomName).emit('estado-remoto', data);
      }
    });

    socket.on('disconnect', () => {
      const datos = removeJugador(roomName, socket.id);
      if (datos) {
        socket.to(roomName).emit('jugadorDesconectado', datos.numero);
        io.to(roomName).emit('jugadores-actualizados', datos.jugadoresRestantes);
      }
    });
  });
};

export default handleGameEvents;
