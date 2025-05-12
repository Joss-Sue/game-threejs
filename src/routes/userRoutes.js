import express from 'express';
import UserController from '../db/controllers/userController.js';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/session', (req, res) => {
    if (!req.session.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }
  
    // Puedes devolver solo parte del usuario si quieres
    const { nombre, email, _id } = req.session.usuario;
    res.json({ nombre, email, _id });
  });
  

export default router;