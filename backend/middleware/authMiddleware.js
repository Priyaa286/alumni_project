const { isAdminEmail } = require('../config/adminList');
const { verifyAdminToken } = require('../utils/adminAuth');

exports.verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const session = verifyAdminToken(token);

  if (session && isAdminEmail(session.email)) {
    req.admin = session;
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Admin authorization required'
  });
};
