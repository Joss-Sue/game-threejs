import Room from '../db/models/roomModel.js';
import sessionMiddleware from '../config/session.js';

const configurarSockets = (io) => {
  // Integrar sesión de Express en Socket.io
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', (socket) => {
    const user = socket.request.session?.usuario;

    if (!user) {
      console.log('Socket no autenticado:', socket.id);
      socket.emit('error', 'No autenticado');
      return;
    }

    console.log('Nuevo usuario conectado:', socket.id, 'Usuario:', user.nombre);

    // Crear una sala (si no tiene una)
    socket.on('createRoom', async (roomName) => {
  try {
    let room = await Room.getUserRoom(user._id);

    if (!room) {
      room = await Room.createRoomInDB(roomName, user._id);
    }

    socket.join(room.name);
    const usuarios = io.sockets.adapter.rooms.get(room.name)?.size || 1;

    io.to(room.name).emit(
      'mensaje',
      `Usuario ${user.nombre} se unió a la sala ${room.name}. Usuarios en sala: ${usuarios}`
    );
  } catch (error) {
    console.error('Error al crear/unirse a sala propia:', error);
    socket.emit('error', error.message);
  }
});


    // Unirse a una sala existente
    socket.on('joinRoom', async (roomName) => {
      try {
        const room = await Room.findOne({ name: roomName });

        if (!room) {
          return socket.emit('error', 'La sala no existe.');
        }

        socket.join(room.name);
        const usuarios = io.sockets.adapter.rooms.get(room.name)?.size || 1;

        io.to(room.name).emit(
          'mensaje',
          `Usuario ${user.nombre} se unió a la sala ${room.name}. Usuarios en sala: ${usuarios}`
        );
      } catch (error) {
        console.error('Error al unirse a la sala:', error);
        socket.emit('error', error.message);
      }
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
      // Si necesitas manejar salida de salas, tendrías que llevar un seguimiento adicional.
    });
  });
};

export default configurarSockets;