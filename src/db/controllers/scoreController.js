import Score from '../models/scoreModel.js';

class ScoreController {
  static async create(req, res) {
    const { jugador, rival, puntaje } = req.body;

    try {
      const score = await Score.createScore({ jugador, rival, puntaje });
      res.status(201).json({ message: 'Puntaje registrado', score });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar el puntaje' });
    }
  }

  static async getAll(req, res) {
    try {
      const scores = await Score.getAllScores();
      res.json(scores);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener los puntajes' });
    }
  }
}

export default ScoreController;
