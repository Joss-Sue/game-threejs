import session from 'express-session';

export default session({
  secret: 'secreto-super-seguro',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si usas HTTPS
});