const crypto = require('crypto');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { isAdminEmail, ADMIN_EMAILS } = require('../config/adminList');
const { sendOTPEmail } = require('../utils/sendEmail');
const { createSignedToken } = require('../utils/signedToken');

// In-Memory Fallback OTP Storage for high reliability (stores hashed OTP)
const memoryOtpStore = new Map();

// Cryptographic hash helper for OTP
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');
};

/**
 * Generate & Send Secure 6-Digit Email OTP (Passwordless)
 */
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email format (e.g., user@example.com).',
      });
    }

    // Generate cryptographically secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Strict 5-minute validity

    // Store hashed OTP in memory
    memoryOtpStore.set(cleanEmail, {
      hashedOtp,
      expiresAt,
    });

    // Store hashed OTP in MongoDB database
    try {
      await OTP.deleteMany({ email: cleanEmail });
      await OTP.create({
        email: cleanEmail,
        hashedOtp,
        expiresAt,
      });
    } catch (dbErr) {
      console.warn('MongoDB OTP store warning (using memory store fallback):', dbErr.message);
    }

    // Send Real Email via Nodemailer
    const emailResult = await sendOTPEmail(cleanEmail, rawOtp);

    if (!emailResult.sent) {
      const smtpMissing = emailResult.reason?.includes('not configured');
      if (smtpMissing && (process.env.NODE_ENV !== 'production' || process.env.LOCAL_DEV_AUTH === 'true')) {
        console.log(`\n==================================================`);
        console.log(`[DEV MODE OTP GENERATED FOR ${cleanEmail}]: ${rawOtp}`);
        console.log(`==================================================\n`);

        return res.status(200).json({
          success: true,
          message: `[DEV MODE] Verification code generated: ${rawOtp}`,
          emailConfigured: false,
          devOtp: rawOtp,
          otpExpiresInSeconds: 300,
        });
      }

      return res.status(503).json({
        success: false,
        message: smtpMissing
          ? 'Email OTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env, then restart the backend.'
          : 'The email server could not send the OTP. Check the SMTP settings in backend/.env and restart the backend.',
        emailConfigured: false,
      });
    }

    // Return response WITHOUT ANY RAW OTP OR HASH EXPOSURE
    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}.`,
      emailConfigured: true,
      otpExpiresInSeconds: 300,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate verification code. Please try again.',
    });
  }
};

/**
 * Verify Secure 6-Digit Email OTP & Authenticate
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email address and 6-digit verification code are required.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const inputHashedOtp = hashOtp(otp);

    let isValid = false;

    // 1. Check Memory OTP store
    const memRecord = memoryOtpStore.get(cleanEmail);
    if (memRecord) {
      if (Date.now() > new Date(memRecord.expiresAt).getTime()) {
        memoryOtpStore.delete(cleanEmail);
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please click Resend Code to receive a new OTP.',
        });
      }

      if (memRecord.hashedOtp === inputHashedOtp) {
        isValid = true;
        // Invalidate immediately upon successful verification
        memoryOtpStore.delete(cleanEmail);
      }
    }

    // 2. Fallback check MongoDB if memory check didn't match
    if (!isValid) {
      try {
        const dbRecord = await OTP.findOne({ email: cleanEmail, hashedOtp: inputHashedOtp });
        if (dbRecord) {
          if (new Date() > new Date(dbRecord.expiresAt)) {
            await OTP.deleteMany({ email: cleanEmail });
            return res.status(400).json({
              success: false,
              message: 'Verification code has expired. Please request a new code.',
            });
          }
          isValid = true;
          // Invalidate immediately upon successful verification
          await OTP.deleteMany({ email: cleanEmail });
        }
      } catch (dbErr) {
        console.warn('MongoDB OTP verification check warning:', dbErr.message);
      }
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check the 6-digit code and try again.',
      });
    }

    // Delete any remaining OTPs for this email to enforce single-use invalidation
    try {
      await OTP.deleteMany({ email: cleanEmail });
    } catch (e) {
      // Ignore delete errors
    }

    // Determine Role Automatically (Admin if listed in adminList, else User)
    const role = isAdminEmail(cleanEmail) ? 'admin' : 'user';

    // Retrieve or create User in MongoDB
    let userObj = null;
    const defaultName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

    try {
      userObj = await User.findOneAndUpdate(
        { email: cleanEmail },
        {
          name: formattedName,
          email: cleanEmail,
          role,
          authProvider: 'email_otp',
        },
        { upsert: true, new: true }
      );
    } catch (dbErr) {
      console.warn('MongoDB user record save warning:', dbErr.message);
    }

    const userData = {
      id: userObj ? userObj._id : Date.now().toString(),
      name: userObj ? userObj.name : formattedName,
      email: cleanEmail,
      role: role,
      authProvider: 'email_otp',
      avatarUrl: userObj?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
    };

    let token;
    try {
      token = createSignedToken({ email: cleanEmail, role });
    } catch (tokenError) {
      return res.status(503).json({ success: false, message: tokenError.message });
    }

    return res.status(200).json({
      success: true,
      message: `Authenticated successfully as ${role.toUpperCase()}.`,
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during OTP verification.',
    });
  }
};

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
