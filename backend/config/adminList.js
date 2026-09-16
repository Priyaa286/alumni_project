/**
 * Administrator Email Configuration
 * 
 * Set exactly one ADMIN_EMAIL value in backend/.env. This is intentionally
 * server-side only: no client-side list can grant administrative access.
 */
const configuredAdmin = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_EMAILS = configuredAdmin ? [configuredAdmin] : [];

/**
 * Helper function to verify if an email address has admin privileges.
 * Performs a case-insensitive check.
 */
const isAdminEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();
  return Boolean(configuredAdmin) && cleanEmail === configuredAdmin;
};

module.exports = {
  ADMIN_EMAILS,
  isAdminEmail,
};
