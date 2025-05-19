import session from 'express-session';

export default session({
  secret: 'secreto-super-seguro',
  resave: false,
  saveUninitialized: true,
  rolling: true, // Renueva el tiempo de expiración en cada solicitud
  cookie: {
    secure: false,           // Cambia a true si usas HTTPS
    maxAge: 1000 * 60 * 60   // 1 hora
  }
});
