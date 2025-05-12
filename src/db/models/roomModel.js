import mongoose from 'mongoose';

// Definición del esquema de la sala
const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Evita duplicados de salas con el mismo nombre
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Método para obtener todas las salas
roomSchema.statics.getAllRooms = async function () {
  try {
    return await this.find(); // 'this' se refiere al modelo de Sala
  } catch (error) {
    throw new Error('Error al obtener las salas');
  }
};

// Método para crear una nueva sala
roomSchema.statics.createRoomInDB = async function (roomName) {
  try {
    // Verificar si la sala ya existe
    const existingRoom = await this.findOne({ name: roomName });
    if (existingRoom) {
      throw new Error('La sala ya existe');
    }

    // Crear y guardar la nueva sala
    const room = new this({ name: roomName });
    await room.save();

    return room;
  } catch (error) {
    throw new Error('Error al crear la sala: ' + error.message);
  }
};

// Crear el modelo de sala
const Room = mongoose.model('Room', roomSchema);

export default Room;
