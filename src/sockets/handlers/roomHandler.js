import Room from '../../db/models/roomModel.js';

const handleRoomEvents = (io, socket, user) => {
  socket.on('createRoom', async (roomData) => {
    try {
      const { name, mundo, nivel, modo } = roomData;

      let room = await Room.getUserRoom(user._id);
      if (!room) {
        room = await Room.createRoomInDB(name, user._id, mundo, nivel, modo);
      }

      socket.emit('roomCreated', room.name);
      socket.broadcast.emit('salasActualizadas');
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('joinRoom', async (roomName) => {
    try {
      const room = await Room.findOne({ name: roomName });
      if (!room) return socket.emit('error', 'La sala no existe');

      const salaSockets = io.sockets.adapter.rooms.get(roomName);
      const numUsuarios = salaSockets?.size || 0;

      if (numUsuarios >= 2) {
        return socket.emit('salaLlena');
      }

      socket.join(roomName);
      socket.emit('roomJoined', roomName);
      io.to(roomName).emit('mensaje', `Jugador ${user.nombre} se unió a la sala`);

      if ((io.sockets.adapter.rooms.get(roomName)?.size || 0) === 2) {
        io.to(roomName).emit('iniciar-juego', roomName);
      }

    } catch (error) {
      console.error('Error al unirse a la sala:', error);
      socket.emit('error', error.message);
    }
  });
};

export default handleRoomEvents;
