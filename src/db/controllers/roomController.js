import Room from '../models/roomModel.js';

class RoomController {
  // Método para obtener todas las salas
  static async getRooms(req, res) {
    try {
      const rooms = await Room.getAllRooms(); // Llamamos al método estático del modelo
      res.json(rooms);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener las salas' });
    }
  }

  // Método para crear una nueva sala
  static async createRoom(req, res) {
    const { name } = req.body;

    try {
      const room = await Room.createRoomInDB(name); // Llamamos al método estático del modelo
      res.status(201).json({ message: 'Sala creada exitosamente', room });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
}

export default RoomController;