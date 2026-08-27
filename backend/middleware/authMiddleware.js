// Middleware to verify authorization header / role for admin endpoints

exports.verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userRoleHeader = req.headers['x-user-role'];

  // Check Bearer token or x-user-role header for demo role validation
  if (
    (authHeader && authHeader.includes('admin')) ||
    userRoleHeader === 'admin'
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Admin authorization required'
  });
};
