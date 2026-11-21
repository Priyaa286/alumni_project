const { decryptSSOToken } = require('vaave-sso-sdk');
const mongoose = require('mongoose');
const { findMemberByEmail } = require('../../controllers/memberController');

/**
 * Handle Notable Alumni Single Sign-On (SSO) from Vaave
 * 1. Receives token query param: /sso?token=...
 * 2. Decrypts SSO token using SEED
 * 3. Base64 encodes the user email
 * 4. Redirects to frontend nomination portal with ?email=...
 */
exports.handleNotableAlumniSSO = async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  let email;
  try {
    const decoded = decodeURIComponent(token);
    const decrypted = await decryptSSOToken(decoded, process.env.SEED);
    email = decrypted?.details?.email || decrypted?.email;
    if (!email) {
      throw new Error('Email not found in decrypted SSO token');
    }
  } catch (err) {
    console.error('SSO token decryption error:', err.message);
    return res.status(400).json({ error: 'Invalid Token' });
  }

  try {
    const encodedEmail = Buffer.from(email.trim().toLowerCase()).toString('base64');
    const redirectBaseUrl = process.env.APP_BASE_URL || 'https://alumni-project-adkg.vercel.app';

    return res.redirect(
      302,
      `${redirectBaseUrl}/nomination?email=${encodeURIComponent(encodedEmail)}`
    );
  } catch (err) {
    console.error('Error redirecting with email:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Lookup User/Member By Email (Supporting Encrypted or Plain Email)
 * Compatible with /api/user-by-email?email=...
 */
exports.getUserByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email query param is required' });
  }

  let resolvedEmail = email;

  if (process.env.SEED) {
    try {
      const decodedEmail = decodeURIComponent(email);
      const decrypted = await decryptSSOToken(decodedEmail, process.env.SEED);
      if (decrypted?.details?.email || decrypted?.email) {
        resolvedEmail = decrypted.details?.email || decrypted.email;
      }
    } catch (err) {
      // If decryption fails, check if the query was passed as plain email
      console.warn('SSO token decrypt note (falling back to direct email):', err.message);
      resolvedEmail = email;
    }
  }

  try {
    const normalized = String(resolvedEmail || '').trim().toLowerCase();
    
    // First try mongoose collection if connected
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const user = await mongoose.connection.db.collection('members').findOne({
        $or: [
          { 'basic.email_id': new RegExp(`^${normalized}$`, 'i') },
          { 'basic.alternate_email_id': new RegExp(`^${normalized}$`, 'i') },
          { 'contact_details.email': new RegExp(`^${normalized}$`, 'i') },
        ],
      });

      if (user) {
        return res.json(user);
      }
    }

    // Fallback through memberController helper (supports test.members.json)
    if (findMemberByEmail) {
      const fallbackMember = await findMemberByEmail(normalized);
      if (fallbackMember) {
        return res.json(fallbackMember);
      }
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    console.error('❌ DB Error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};
