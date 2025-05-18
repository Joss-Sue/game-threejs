import sessionMiddleware from './middleware/authMiddleware.js';
import handleRoomEvents from './handlers/roomHandler.js';
import handleGameEvents from './handlers/gameHandler.js';

const configurarSockets = (io) => {
  io.use(sessionMiddleware);

  io.on('connection', (socket) => {
    const user = socket.request.session?.usuario;
    if (!user) {
      socket.emit('error', 'No autenticado');
      return;
    }

    console.log('[Socket] Usuario conectado:', user.nombre);

    handleRoomEvents(io, socket, user);
    handleGameEvents(io, socket, user);
  });
};

export default configurarSockets;
