function ensureAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
}

function ensureAdmin(req, res, next) {
  if (req.session?.user?.isAdmin) return next();
  res.status(403).send('Forbidden');
}

module.exports = { ensureAuth, ensureAdmin };
