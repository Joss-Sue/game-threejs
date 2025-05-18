import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // ya no es requerido
  fecha_creacion: { type: Date, default: Date.now },
});

// Método para buscar por email
userSchema.statics.findUserByEmail = async function (email) {
  return await this.findOne({ email });
};

// Método para crear usuario tradicional
userSchema.statics.createUser = async function (nombre, email, password) {
  const newUser = new this({ nombre, email, password });
  return await newUser.save();
};

const User = mongoose.model('User', userSchema);
export default User;