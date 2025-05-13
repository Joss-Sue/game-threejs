import Room from '../models/roomModel.js';

class RoomController {
  // Método para obtener todas las salas, excepto la del usuario
  static async getRooms(req, res) {
    try {
      const rooms = await Room.getAllRooms(); // Llamamos al método estático del modelo
      res.json(rooms);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener las salas' });
    }
  }

  // Método para obtener la sala del usuario
  static async getUserRoom(req, res) {
    // Accediendo al ID del usuario desde la sesión
    const userId = req.session.usuario?._id; // Asegúrate de tener el ID del usuario guardado en la sesión

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    try {
      const userRoom = await Room.getUserRoom(userId); // Llamamos al método estático que busca la sala del usuario

      if (userRoom) {
        res.json({ room: userRoom });
      } else {
        res.json({ message: 'No tienes ninguna sala creada.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener la sala del usuario' });
    }
  }

  // Método para crear una nueva sala
  static async createRoom(req, res) {
    const { name } = req.body;
    const userId = req.session.usuario?._id; // Asegúrate de tener el ID del usuario en la sesión

    if (!userId) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    try {
      // Crear la sala, pasando el id del usuario como creador
      const room = await Room.createRoomInDB(name, userId);

      res.status(201).json({ message: 'Sala creada exitosamente', room });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }

    static async deleteRoom(req, res) {
    const roomId = req.params.id;
    const userId = req.session.usuario?._id;

    if (!userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    try {
      const room = await Room.deleteRoomById(roomId, userId);
      res.json({ message: 'Sala eliminada correctamente', room });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
  
}

export default RoomController;

