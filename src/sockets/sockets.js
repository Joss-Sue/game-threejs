import Room from '../db/models/roomModel.js';
import sessionMiddleware from '../config/session.js';
import configurarJuegoSockets from './juego.js';

const configurarSockets = (io) => {
  // Middleware para integrar sesión de Express en Socket.io
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', async (socket) => {
    const user = socket.request.session?.usuario;

    if (!user) {
      console.log('Socket no autenticado:', socket.id);
      socket.emit('error', 'No autenticado');
      return;
    }

    console.log('Nuevo usuario conectado:', socket.id, 'Usuario:', user.nombre);

    // Función interna para unirse a una sala y configurar lógica de juego
    async function unirseASala(roomName) {
      try {
        const room = await Room.findOne({ name: roomName });
        if (!room) {
          socket.emit('error', `La sala "${roomName}" no existe.`);
          return;
        }

        socket.join(room.name);
        const usuarios = io.sockets.adapter.rooms.get(room.name)?.size || 1;

        io.to(room.name).emit(
          'mensaje',
          `Usuario ${user.nombre} se unió a la sala ${room.name}. Usuarios en sala: ${usuarios}`
        );

        // Configura lógica específica de juego
        configurarJuegoSockets(io, socket, user);

        // Emitir evento para iniciar juego si ya hay 2 jugadores
        if (usuarios === 2) {
          io.to(room.name).emit('mensaje', 'Ya hay dos jugadores en la sala. ¡Pueden empezar a jugar!');
          io.to(room.name).emit('iniciar-juego', room.name);
        }

         // Emitir al usuario actual
        socket.emit('roomJoined', room.name);

        // Emitir a otros para que recarguen
        socket.broadcast.emit('salasActualizadas');
        
      } catch (error) {
        console.error('Error al unirse a la sala:', error);
        socket.emit('error', error.message);
      }
    }

    // Evento para crear una sala propia o reutilizar existente
    socket.on('createRoom', async (roomName) => {
      try {
        let room = await Room.getUserRoom(user._id);

        if (!room) {
          room = await Room.createRoomInDB(roomName, user._id);
        }

        // Notificar al creador
        socket.emit('roomCreated', room.name);

        // Notificar a todos los demás para que refresquen
        socket.broadcast.emit('salasActualizadas');

      } catch (error) {
        console.error('Error al crear sala:', error);
        socket.emit('error', error.message);
      }
    });

    // Evento para unirse a una sala existente
    socket.on('joinRoom', unirseASala);

    // Desconexión: limpiar jugadores y emitir mensaje
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
      // Aquí puedes manejar la lógica para quitar al jugador de las estructuras,
      // notificar a la sala, etc.
      // Ejemplo:
      // for (const sala of socket.rooms) {
      //   if (sala !== socket.id) {
      //     io.to(sala).emit('mensaje', `Jugador se desconectó: ${user.nombre}`);
      //     // Eliminar jugador de estructuras internas si tienes alguna
      //   }
      // }
    });
  });
};

export default configurarSockets;

