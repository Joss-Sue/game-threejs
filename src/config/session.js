import session from 'express-session';

export default session({
  secret: 'secreto-super-seguro',
  resave: false,
  saveUninitialized: true
});