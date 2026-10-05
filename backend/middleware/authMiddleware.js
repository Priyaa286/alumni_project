const { verifySignedToken } = require('../utils/signedToken');

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const user = verifySignedToken(token);
  if (user && ['admin', 'user'].includes(user.role) && user.email) {
    req.user = user;
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Please sign in again to continue.'
  });
};

exports.verifyAdmin = (req, res, next) => {
  exports.authenticate(req, res, (error) => {
    if (error) return next(error);
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Administrator access is required.' });
    }
    next();
  });
};
