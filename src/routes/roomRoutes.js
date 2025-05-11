import express from 'express';
import RoomController from '../db/controllers/roomController.js';

const router = express.Router();

// Obtener todas las salas
router.get('/rooms', RoomController.getRooms);

// Crear una nueva sala
router.post('/rooms', RoomController.createRoom);

export default router;