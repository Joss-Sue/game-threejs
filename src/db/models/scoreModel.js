import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  jugador: {
    type: String,
    required: true
  },
  rival: {
    type: String,
    required: true
  },
  puntaje: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

scoreSchema.statics.createScore = async function (data) {
  const score = new this(data);
  return await score.save();
};

scoreSchema.statics.getAllScores = async function () {
  return await this.find().sort({ fecha: -1 });
};

const Score = mongoose.model('Score', scoreSchema);
export default Score;
