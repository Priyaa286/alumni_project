const { createSignedToken, verifySignedToken } = require('./signedToken');

const createAdminToken = (email) => {
  return createSignedToken({ email, role: 'admin' });
};

const verifyAdminToken = (token) => {
  const data = verifySignedToken(token);
  return data?.role === 'admin' && data.email ? data : null;
};

module.exports = { createAdminToken, verifyAdminToken };
