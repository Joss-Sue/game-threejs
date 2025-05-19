import Room from '../db/models/roomModel.js';
import sessionMiddleware from '../config/session.js';
import configurarJuegoSockets from './juego.js';

const configurarSockets = (io) => {
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', async (socket) => {
    const user = socket.request.session?.usuario;
    if (!user) {
      socket.emit('error', 'No autenticado');
      return;
    }

    console.log('[Socket] Usuario conectado:', user.nombre);

    socket.on('joinRoom', async (roomName) => {
      try {
        const room = await Room.findOne({ name: roomName });
        if (!room) {
          return socket.emit('error', 'La sala no existe');
        }

        const salaSockets = io.sockets.adapter.rooms.get(roomName);
        const numUsuarios = salaSockets?.size || 0;

        if (numUsuarios >= 2) {
          return socket.emit('salaLlena');
        }

        socket.join(roomName);
        socket.emit('roomJoined', roomName);
        io.to(roomName).emit('mensaje', `Jugador ${user.nombre} se unió a la sala ${roomName}`);

        // 👇 Aquí verificamos si ahora hay 2 jugadores
        const socketsEnSala = io.sockets.adapter.rooms.get(roomName);
        if (socketsEnSala?.size === 2) {
          io.to(roomName).emit('mensaje', 'Están listos para jugar, cargando...');
          io.to(roomName).emit('iniciar-juego', roomName);
        }

      } catch (error) {
        console.error('Error al unirse a la sala:', error);
        socket.emit('error', error.message);
      }
    });


    socket.on('iniciarJuego', (roomName) => {
      configurarJuegoSockets(io, socket, user, roomName);
    });

    socket.on('createRoom', async (roomData) => {
  console.log('📥 Evento recibido: createRoom');
  console.log('➡️ Nombre de la sala recibida:', roomData.name);

  // Asegúrate de que `user` esté definido
 

  try {
    console.log('🛠️ Creando sala en la base de datos...');
    const room = await Room.createRoomInDB(roomData.name, roomData.user, roomData.mundo, roomData.nivel, roomData.modo);

    console.log('✅ Sala creada:', room);
    socket.emit('roomCreated', room.name);
    socket.broadcast.emit('salasActualizadas');
  } catch (error) {
    console.error('❌ Error al crear la sala:', error);
    socket.emit('error', error.message);
  }
});

  });
};

export default configurarSockets;


