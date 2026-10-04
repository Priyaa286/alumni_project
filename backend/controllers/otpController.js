const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { createSignedToken } = require('../utils/signedToken');

// In-memory OTP storage: email -> { otp, expiresAt, verified }
const otpStore = new Map();
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp).trim()).digest('hex');

// Helper to create Nodemailer transporter using configured SMTP/Gmail/Outlook credentials
const getTransporter = async () => {
  // 1. Check for standard custom SMTP config in .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST.trim(),
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER.trim(),
          pass: process.env.SMTP_PASS.trim(),
        },
      }),
      from: process.env.SMTP_FROM || `"NEC Alumni Portal" <${process.env.SMTP_USER.trim()}>`,
      type: 'custom',
    };
  }

  // 2. Check for Outlook / Hotmail config in .env
  if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASS) {
    const outlookUser = process.env.OUTLOOK_USER.trim();
    const outlookPass = process.env.OUTLOOK_PASS.trim();
    return {
      transporter: nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: outlookUser,
          pass: outlookPass,
        },
        tls: {
          ciphers: 'SSLv3',
          rejectUnauthorized: false
        }
      }),
      from: `"NEC Alumni Portal" <${outlookUser}>`,
      type: 'outlook',
    };
  }

  // 3. Check for Gmail config in .env
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    const gmailUser = process.env.GMAIL_USER.trim();
    const gmailPass = process.env.GMAIL_PASS.replace(/\s+/g, '');
    return {
      transporter: nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPass, // App Password without spaces
        },
      }),
      from: `"NEC Alumni Portal" <${gmailUser}>`,
      type: 'gmail',
    };
  }

  return null;
};

// Backup transporter if main transporter fails authentication
// Send OTP controller for nominee email verification.
exports.sendOtp = async (req, res) => {
  let cleanEmail = '';
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required',
      });
    }

    cleanEmail = email.trim().toLowerCase();
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

    otpStore.set(cleanEmail, { otpHash: hashOtp(otp), expiresAt, attempts: 0 });

    let mailConfig = await getTransporter();

    if (!mailConfig) {
      return res.status(503).json({ success: false, message: 'Nominee verification email is not configured. Ask the administrator to configure SMTP.' });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #8A2BE2; text-align: center;">NEC Alumni Award Nomination Portal</h2>
        <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
        <p style="font-size: 16px; color: #334155;">Hello,</p>
        <p style="font-size: 15px; color: #334155;">
          Your One-Time Password (OTP) to complete the declaration for the Notable Alumni Award Nomination is:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #8A2BE2; background-color: #f3e8ff; padding: 12px 24px; border-radius: 8px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #64748b;">
          This code is valid for <strong>10 minutes</strong>. Please do not share this OTP with anyone.
        </p>
        <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          National Engineering College, K.R. Nagar, Kovilpatti - 628 503
        </p>
      </div>
    `;

    try {
      await mailConfig.transporter.sendMail({
        from: mailConfig.from,
        to: cleanEmail,
        subject: 'Your Verification Code - NEC Alumni Award Nomination',
        html: htmlContent,
      });

      console.log(`[EMAIL SENT] Nominee verification OTP sent to ${cleanEmail}`);
      return res.status(200).json({
        success: true,
        message: `OTP sent successfully to ${cleanEmail}. Please check your email inbox.`,
      });
    } catch (primaryMailError) {
      otpStore.delete(cleanEmail);
      console.error('[SMTP ERROR] Nominee verification email delivery failed:', primaryMailError.message);
      return res.status(503).json({ success: false, message: 'Could not deliver the verification email. Check SMTP settings and try again.' });
    }
  } catch (error) {
    console.error('Error in sendOtp:', error);
    const targetEmail = cleanEmail || 'recipient';
    return res.status(500).json({
      success: false,
      message: `Failed to process OTP request for ${targetEmail}: ${error.message}`,
    });
  }
};

// Verify OTP controller
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const storedRecord = otpStore.get(cleanEmail);

    if (!storedRecord) {
      return res.status(400).json({
        success: false,
        message: 'No OTP requested for this email address or OTP has expired.',
      });
    }

    if (Date.now() > storedRecord.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new verification code.',
      });
    }

    storedRecord.attempts += 1;
    if (storedRecord.attempts > 5) {
      otpStore.delete(cleanEmail);
      return res.status(429).json({ success: false, message: 'Too many incorrect codes. Request a new verification email.' });
    }
    if (storedRecord.otpHash !== hashOtp(otp)) {
      otpStore.set(cleanEmail, storedRecord);
      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP code. Please check your email and try again.',
      });
    }

    otpStore.delete(cleanEmail);
    const verificationToken = createSignedToken({ email: cleanEmail, purpose: 'nominee-email-verification' }, 30 * 60 * 1000);

    return res.status(200).json({
      success: true,
      message: 'Email address verified successfully!',
      verificationToken,
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while verifying OTP.',
    });
  }
};
