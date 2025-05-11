import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import requiereLogin from '../middlewares/requiereLogin.js';

const router = express.Router();

// Necesario para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta principal protegida
router.get('/', requiereLogin, (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

export default router;