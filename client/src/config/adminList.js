/**
 * Client-side Administrator Email Configuration
 * 
 * Administrative authorization is server-side only. This module remains only
 * for backwards compatibility; it must never grant client-side access.
 */
export const ADMIN_EMAILS = [];

export const isAdminEmail = (email) => {
  return false;
};
