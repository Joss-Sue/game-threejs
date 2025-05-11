import Room from '../db/models/roomModel.js';

const configurarSockets = (io) => {
  io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado:', socket.id);

    // Cuando un usuario crea una sala
    socket.on('createRoom', async (roomName) => {
      try {
        // Verificar si la sala existe en la base de datos
        const room = await Room.createRoomInDB(roomName);

        // Unir al socket a la sala
        socket.join(roomName);
        io.to(roomName).emit('message', `Usuario ${socket.id} se unió a la sala ${roomName}`);
      } catch (error) {
        console.error(error);
        socket.emit('error', error.message);
      }
    });

    // Cuando un usuario se une a una sala
    socket.on('joinRoom', async (roomName) => {
      try {
        // Verificar si la sala existe en la base de datos
        const rooms = await Room.getAllRooms();
        const roomExists = rooms.some((r) => r.name === roomName);

        if (!roomExists) {
          return socket.emit('error', 'La sala no existe.');
        }

        // Unir al socket a la sala
        socket.join(roomName);
        io.to(roomName).emit('message', `Usuario ${socket.id} se unió a la sala ${roomName}`);
      } catch (error) {
        console.error(error);
        socket.emit('error', error.message);
      }
    });

    // Cuando un usuario se desconecta
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
    });
  });
};

export default configurarSockets;


