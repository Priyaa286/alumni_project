/**
 * Backend administrator allowlist. Configure ADMIN_EMAILS as a comma-separated
 * list in the server environment. Defaults support local development only.
 */
const DEFAULT_ADMIN_EMAILS = [
  'admin@nec.edu',
  'principal@nec.edu',
  'alumni@nec.edu',
  'praga007thija@gmail.com',
  'm.priyadharshini286@gmail.com',
  'sharumathimurugesan2006@gmail.com'
];

const configuredAdminEmails = String(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
const ADMIN_EMAILS = configuredAdminEmails.length ? configuredAdminEmails : DEFAULT_ADMIN_EMAILS;

/**
 * Helper function to verify if an email address has admin privileges.
 * Performs a case-insensitive check.
 */
const isAdminEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.trim().toLowerCase() === cleanEmail);
};

module.exports = {
  ADMIN_EMAILS,
  isAdminEmail,
};
