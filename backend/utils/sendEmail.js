const nodemailer = require('nodemailer');

/**
 * Check if required SMTP credentials are present in environment variables
 */
const isSMTPConfigured = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return Boolean(host && user && pass);
};

/**
 * Create Nodemailer SMTP transporter using existing environment variables
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const secure = process.env.SMTP_SECURE === 'true' || Number(port) === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Verify SMTP connection using transporter.verify()
 */
const verifySMTPConnection = async () => {
  if (!isSMTPConfigured()) {
    console.log('[SMTP STATUS]: Credentials NOT configured in environment variables (SMTP_HOST, SMTP_USER, SMTP_PASS).');
    return false;
  }

  try {
    const transporter = createTransporter();
    if (!transporter) return false;
    await transporter.verify();
    console.log('[SMTP STATUS]: Connection successfully verified with host.');
    return true;
  } catch (error) {
    console.error('[SMTP STATUS]: Connection verification failed:', error.message);
    return false;
  }
};

/**
 * Send Email OTP using Nodemailer
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 */
const sendOTPEmail = async (to, otp) => {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'Alumni Portal <alumni@nec.edu>';

  if (!isSMTPConfigured()) {
    console.log('[SMTP ERROR]: Cannot send email. SMTP credentials are not configured.');
    return {
      sent: false,
      reason: 'SMTP email credentials not configured in backend environment variables.',
    };
  }

  try {
    const transporter = createTransporter();
    if (!transporter) {
      return { sent: false, reason: 'Transporter creation failed.' };
    }

    const textContent = `Hello,

Your one-time password for logging into the Alumni Portal is:

${otp}

This OTP will expire in 5 minutes.

If you did not request this OTP, please ignore this email.

Regards,
NEC Alumni Portal`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #6b21a8; margin: 0; font-size: 22px;">National Engineering College</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Alumni Association</p>
        </div>
        
        <p style="color: #334155; font-size: 14px; margin-bottom: 16px;">Hello,</p>
        <p style="color: #334155; font-size: 14px; margin-bottom: 16px;">Your one-time password for logging into the Alumni Portal is:</p>
        
        <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #7e22ce; font-family: monospace; margin: 12px 0;">
            ${otp}
          </div>
          <p style="color: #6b21a8; font-size: 12px; margin-bottom: 0;">This OTP will expire in <strong>5 minutes</strong>.</p>
        </div>
        
        <p style="color: #475569; font-size: 13px; line-height: 1.5;">
          If you did not request this OTP, please ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        
        <p style="color: #94a3b8; font-size: 12px; text-align: left;">
          Regards,<br />
          <strong>NEC Alumni Portal</strong>
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to,
      subject: 'Your Alumni Portal OTP',
      text: textContent,
      html: htmlContent,
    });

    console.log(`[SMTP SUCCESS]: OTP email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('[SMTP ERROR]: Failed to send email via Nodemailer:', error.message);
    return { sent: false, error: error.message };
  }
};

module.exports = {
  isSMTPConfigured,
  verifySMTPConnection,
  sendOTPEmail,
};

