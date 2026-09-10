/**
 * Administrator Email Configuration
 * 
 * ADD YOUR ADMIN EMAIL ADDRESSES HERE.
 * Any email address included in this array will be granted full 'admin' privileges
 * upon successful authentication (Email + Password or Sign in with Google).
 */
const ADMIN_EMAILS = [
  'admin@nec.edu',
  'principal@nec.edu',
  'alumni@nec.edu',
  // Add your email address here, e.g.:
  // 'your-email@gmail.com',
];

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
