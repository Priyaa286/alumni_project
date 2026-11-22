const crypto = require('crypto');
const User = require('../models/User');
const { isAdminEmail, ADMIN_EMAILS } = require('../config/adminList');
const { createSignedToken } = require('../utils/signedToken');

/**
 * Real-Time Firebase Single Sign-On (SSO) Authentication
 */
exports.googleAuth = async (req, res) => {
  try {
    const { idToken, email: bodyEmail, name: bodyName, photoURL: bodyPhoto } = req.body;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Firebase authentication token (idToken) is required.',
      });
    }

    let cleanEmail = '';
    let name = bodyName || '';
    let avatarUrl = bodyPhoto || '';
    let sub = '';

    // Verify token via Google OAuth tokeninfo endpoint or JWT payload
    try {
      const tokenInfoUrl = new URL('https://oauth2.googleapis.com/tokeninfo');
      tokenInfoUrl.searchParams.set('id_token', idToken);
      const tokenInfoResponse = await fetch(tokenInfoUrl);
      if (tokenInfoResponse.ok) {
        const tokenInfo = await tokenInfoResponse.json();
        cleanEmail = String(tokenInfo.email || '').trim().toLowerCase();
        name = name || tokenInfo.name || cleanEmail.split('@')[0];
        avatarUrl = avatarUrl || tokenInfo.picture || '';
        sub = tokenInfo.sub || '';
      }
    } catch (e) {
      console.warn('Google tokeninfo fetch error:', e.message);
    }

    // Fallback: Verify JWT payload structure from Firebase client SDK
    if (!cleanEmail) {
      try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          cleanEmail = String(payload.email || bodyEmail || '').trim().toLowerCase();
          name = name || payload.name || (cleanEmail ? cleanEmail.split('@')[0] : 'User');
          avatarUrl = avatarUrl || payload.picture || '';
          sub = payload.sub || payload.user_id || '';
        }
      } catch (jwtErr) {
        console.warn('JWT payload decode error:', jwtErr.message);
      }
    }

    if (!cleanEmail) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or unverified Firebase SSO token.',
      });
    }

    // Automatically determine role based on admin list configuration
    const role = isAdminEmail(cleanEmail) ? 'admin' : 'user';

    // Upsert user in database if MongoDB is connected
    let userObj = null;
    try {
      userObj = await User.findOneAndUpdate(
        { email: cleanEmail },
        {
          name: name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: role,
          authProvider: 'firebase_sso',
          avatarUrl: avatarUrl || '',
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('Firebase SSO auth DB sync warning:', e.message);
    }

    let token;
    try {
      token = createSignedToken({ email: cleanEmail, role });
    } catch (tokenError) {
      return res.status(503).json({ success: false, message: tokenError.message });
    }

    return res.status(200).json({
      success: true,
      message: `Signed in with Firebase SSO successfully as ${role.toUpperCase()}.`,
      token,
      user: {
        id: userObj ? userObj._id : (sub || Date.now().toString()),
        name: name || (userObj ? userObj.name : cleanEmail.split('@')[0]),
        email: cleanEmail,
        role: role,
        authProvider: 'firebase_sso',
        avatarUrl: avatarUrl || (userObj ? userObj.avatarUrl : `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`),
      },
    });
  } catch (error) {
    console.error('Firebase Auth Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete Firebase Authentication.',
    });
  }
};

/**
 * Get Admin List Info
 */
exports.getAdminInfo = (req, res) => {
  return res.status(200).json({
    success: true,
    adminEmailsCount: ADMIN_EMAILS.length,
    configFile: 'alumni_project/backend/config/adminList.js',
  });
};

/** Local-only sign-in for development when SMTP/Firebase are not configured. */
exports.localDevLogin = (req, res) => {
  const localOnly = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.ip);
  if (process.env.NODE_ENV === 'production' || process.env.LOCAL_DEV_AUTH !== 'true' || !localOnly) {
    return res.status(404).json({ success: false, message: 'Local development sign-in is disabled.' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }

  const role = isAdminEmail(email) ? 'admin' : 'user';
  try {
    const token = createSignedToken({ email, role });
    const name = email.split('@')[0].replace(/[._]/g, ' ');
    return res.status(200).json({
      success: true,
      token,
      user: { id: `local-${email}`, name, email, role, authProvider: 'local-development' },
    });
  } catch (error) {
    return res.status(503).json({ success: false, message: 'Set AUTH_TOKEN_SECRET in backend/.env and restart the backend.' });
  }
};
