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
        return res.status(400).send('Correo electrónico o contraseña incorrectos');
      }

      req.session.usuario = {
        _id: user._id,
        nombre: user.nombre,
        email: user.email
      };

      req.session.save(err => {
        if (err) {
          console.error('Error al guardar la sesión:', err);
          return res.status(500).send('Error al guardar la sesión');
        }

        // Redirige al usuario al inicio
        return res.redirect('/index.html'); // o simplemente '/' si tienes una ruta vista definida
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error en el inicio de sesión');
    }
  }
}

export default UserController;

