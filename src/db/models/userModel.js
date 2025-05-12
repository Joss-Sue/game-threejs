import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fecha_creacion: { type: Date, default: Date.now },
  })

userSchema.statics.findUserByEmail = async function(email) {
  return await this.findOne({ email });
};

userSchema.statics.createUser = async function(nombre, email, password) {
  const newUser = new this({ nombre, email, password });
  return await newUser.save();
};

const User = mongoose.model('User', userSchema);
export default User;