import express from 'express';
import requiereLogin from '../middlewares/requiereLogin.js';  // Asegúrate que la ruta sea correcta
import UserController from '../db/controllers/userController.js';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/logout', UserController.logout);
router.post('/login/facebook', UserController.loginWithFacebook);

// Ruta protegida que devuelve datos de usuario en sesión (normal o Facebook)
router.get('/session', requiereLogin, (req, res) => {
  const { nombre, email, _id, facebookId } = req.session.usuario || {};
  res.json({ nombre, email, _id, facebookId });
});

export default router;
