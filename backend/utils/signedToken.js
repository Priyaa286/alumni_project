const crypto = require('crypto');

const secret = () => process.env.AUTH_TOKEN_SECRET;

const sign = (encodedPayload) => crypto
  .createHmac('sha256', secret())
  .update(encodedPayload)
  .digest('base64url');

const createSignedToken = (claims, ttlMs = 7 * 24 * 60 * 60 * 1000) => {
  if (!secret()) throw new Error('AUTH_TOKEN_SECRET is not configured.');
  const payload = Buffer.from(JSON.stringify({ ...claims, exp: Date.now() + ttlMs })).toString('base64url');
  return `${payload}.${sign(payload)}`;
};

const verifySignedToken = (token) => {
  if (!secret() || typeof token !== 'string') return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return claims.exp > Date.now() ? claims : null;
  } catch {
    return null;
  }
};

module.exports = { createSignedToken, verifySignedToken };
