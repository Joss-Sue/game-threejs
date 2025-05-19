// middlewares/requiereLogin.js
export default function requiereLogin(req, res, next) {
  if (req.session.usuario) {
    return next();
  }

  const isAjax = req.xhr || req.headers.accept.indexOf('json') > -1;
  if (isAjax) {
    return res.status(401).json({ message: 'No autenticado' });
  } else {
    return res.redirect('/login.html');
  }
}
