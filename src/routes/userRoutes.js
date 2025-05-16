import express from 'express';
import requiereLogin from '../middlewares/requiereLogin.js';
import UserController from '../db/controllers/userController.js';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/session', requiereLogin, (req, res) => { // protegida
  const { nombre, email, _id } = req.session.usuario;
  res.json({ nombre, email, _id });
});

export default router;