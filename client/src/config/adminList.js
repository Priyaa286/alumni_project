/**
 * Client-side Administrator Email Configuration
 * 
 * ADD YOUR ADMIN EMAIL ADDRESSES HERE AS WELL FOR QUICK CLIENT-SIDE UI CHECKS.
 * Note: The backend file (backend/config/adminList.js) is authoritative for security.
 */
export const ADMIN_EMAILS = [
  'admin@nec.edu',
  'principal@nec.edu',
  'alumni@nec.edu',
  // Add your email address here, e.g.:
  // 'your-email@gmail.com',
];

export const isAdminEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.trim().toLowerCase() === cleanEmail);
};
