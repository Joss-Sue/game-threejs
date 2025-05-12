import express from 'express';
import ScoreController from '../db/controllers/scoreController.js';

const router = express.Router();

router.post('/scores', ScoreController.create);
router.get('/scores', ScoreController.getAll);

export default router;
