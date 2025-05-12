import http from 'http';
import { Server } from 'socket.io';
import conectarDB from './src/db/config/mongoose.js';
import configurarSockets from './src/sockets/sockets.js';
import app from './src/app.js';

const server = http.createServer(app);
const io = new Server(server);

// Conectar a la base de datos
await conectarDB();

// Configurar sockets
configurarSockets(io);

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});