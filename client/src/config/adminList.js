/**
 * Client-side Administrator Email Configuration
 * 
 * ADD YOUR ADMIN EMAIL ADDRESSES HERE AS WELL FOR QUICK CLIENT-SIDE UI CHECKS.
 * Note: The backend file (backend/config/adminList.js) is authoritative for security.
 */
export const ADMIN_EMAILS = [
  '24205023@nec.edu.in',
  '24205035@nec.edu.in',
  '24205055@nec.edu.in',
  'admin@nec.edu',
  'principal@nec.edu',
  'alumni@nec.edu',
  'praga007thija@gmail.com',
  'm.priyadharshini286@gmail.com',
];

export const isAdminEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.trim().toLowerCase() === cleanEmail);
};
