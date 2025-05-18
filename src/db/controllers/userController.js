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

  static logout(req, res) {
    req.session.destroy(err => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return res.status(500).send('Error al cerrar sesión');
      }

      // Redirige al formulario de login
      res.redirect('/login.html');
    });
  }

// AuthController.js
static async loginWithFacebook(req, res) {
  const { facebookId, nombre, email } = req.body;

  if (!facebookId || !nombre) {
    return res.status(400).send('Datos de Facebook incompletos');
  }

  try {
    // Solo guarda los datos en la sesión, no en la base de datos
    req.session.usuario = {
      nombre,
      email: email || '',
      facebookId
    };

    req.session.save(err => {
      if (err) {
        console.error('Error al guardar la sesión:', err);
        return res.status(500).send('Error al guardar sesión');
      }
      return res.status(200).send('Login de Facebook exitoso');
    });
  } catch (error) {
    console.error('Error en login con Facebook:', error);
    return res.status(500).send('Error en el servidor');
  }
}



}

export default UserController;

