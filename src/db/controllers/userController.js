import User from '../models/userModel.js';

class UserController {
  static async register(req, res) {
    const { username, email, password } = req.body;

    try {
      const userExists = await User.findUserByEmail(email);
      if (userExists) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
      }

      const newUser = await User.createUser(username, email, password);

      req.session.usuario = newUser;
      return res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al registrar el usuario' });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    try {
      const user = await User.findUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(400).json({ message: 'Correo electrónico o contraseña incorrectos' });
      }

      req.session.usuario = user;
      return res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error en el inicio de sesión' });
    }
  }
}

export default UserController;

