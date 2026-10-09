/**
 * Client-side Administrator Email Configuration
 * 
 * ADD YOUR ADMIN EMAIL ADDRESSES HERE AS WELL FOR QUICK CLIENT-SIDE UI CHECKS.
 * Note: The backend file (backend/config/adminList.js) is authoritative for security.
 */
export const ADMIN_EMAILS = [
  'praga007thija@gmail.com',
  'priyamalarkannan666@gmail.com',
  'sharumathimurugesan2006@gmail.com',
];

export const isAdminEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.trim().toLowerCase() === cleanEmail);
};
