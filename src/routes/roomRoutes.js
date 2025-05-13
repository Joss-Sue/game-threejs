import express from 'express';
import RoomController from '../db/controllers/roomController.js';

const router = express.Router();

// Obtener todas las salas (excepto la del usuario)
router.get('/rooms', RoomController.getRooms);

// Obtener la sala del usuario
router.get('/rooms/user', RoomController.getUserRoom); // Nueva ruta para obtener la sala del usuario

// Crear una nueva sala
router.post('/rooms', RoomController.createRoom);

// Eliminar una sala
router.delete('/rooms/:id', RoomController.deleteRoom);

export default router;
