export default function requiereLogin(req, res, next) {
    if (req.session.usuario) next();
    else res.redirect('/login.html');
  }