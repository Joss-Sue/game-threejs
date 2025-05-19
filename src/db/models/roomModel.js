import mongoose from 'mongoose';

// Definición del esquema de la sala
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Evita duplicados de salas con el mismo nombre
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Referencia al modelo de Usuario
    required: true, // Este campo es obligatorio, cada sala debe tener un creador
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  world: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
});

// Método para obtener todas las salas (sin excluir la del usuario)
roomSchema.statics.getAllRooms = async function () {
  try {
    // Trae todas las salas ordenadas por fecha descendente
    return await this.find().sort({ createdAt: -1 });
  } catch (error) {
    throw new Error('Error al obtener las salas: ' + error.message);
  }
};

// Método para obtener la sala propia de un usuario
roomSchema.statics.getUserRoom = async function (userId) {
  try {
    // Buscamos la sala del usuario
    const room = await this.findOne({ creator: userId });
    return room; // Si existe, la devolvemos, si no, será null
  } catch (error) {
    throw new Error('Error al obtener la sala del usuario: ' + error.message);
  }
};

// Método para crear una nueva sala
roomSchema.statics.createRoomInDB = async function (roomName, userId, mundo, nivel, modo) {
  try {
    // Verificar si la sala ya existe
    const existingRoom = await this.findOne({ name: roomName });
    if (existingRoom) {
      throw new Error('La sala ya existe');
    }

    // Crear y guardar la nueva sala
    const room = new this({ name: roomName, creator: userId, world: mundo, level: nivel, mode: modo });
    await room.save();

    return room;
  } catch (error) {
    throw new Error('Error al crear la sala: ' + error.message);
  }
};

roomSchema.statics.deleteRoomById = async function (roomId, userId) {
  try {
    const room = await this.findOneAndDelete({ _id: roomId, creator: userId });

    if (!room) {
      throw new Error('No tienes permiso para eliminar esta sala o no existe');
    }

    return room;
  } catch (error) {
    throw new Error('Error al eliminar la sala: ' + error.message);
  }
};

// Crear el modelo de sala
const Room = mongoose.model('Room', roomSchema);

export default Room;
