const crypto = require('crypto');

const TOKEN_TTL_MS = 60 * 60 * 1000;

const getSecret = () => process.env.AUTH_TOKEN_SECRET;

const sign = (value) => crypto.createHmac('sha256', getSecret()).update(value).digest('hex');

const createAdminToken = (email) => {
  if (!getSecret()) throw new Error('AUTH_TOKEN_SECRET is not configured.');
  const payload = Buffer.from(JSON.stringify({ email, role: 'admin', exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
};

const verifyAdminToken = (token) => {
  if (!getSecret()) return null;
  if (!token || typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = sign(payload);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'admin' && data.email && data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
};

module.exports = { createAdminToken, verifyAdminToken };
