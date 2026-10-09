const nodemailer = require('nodemailer');

/**
 * Check if required SMTP credentials are present in environment variables
 */
const isSMTPConfigured = () => {
  const host = process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : null);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;
  return Boolean(host && user && pass);
};

/**
 * Create Nodemailer SMTP transporter using existing environment variables
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : null);
  const port = process.env.SMTP_PORT || 587;
  const secure = process.env.SMTP_SECURE === 'true' || Number(port) === 465;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

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

/**
 * Send Nomination Form Opening Announcement Email
 * @param {string} to - Recipient email address (e.g. praga007thija@gmail.com)
 * @param {string} formUrl - Full link to the nomination form
 */
const sendNominationFormOpenEmail = async (to = 'priyamalarkannan666@gmail.com', formUrl = 'https://alumni-project-adkg.vercel.app/nomination') => {
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

    const textContent = `Hello Alumni,

We are pleased to announce that the National Engineering College (NEC) Alumni Award Nomination Form is now OPEN!

You can submit your nomination by visiting the following link:
${formUrl}

Please complete and submit the nomination form before the closing date.

Regards,
NEC Alumni Association & Award Committee
National Engineering College, Kovilpatti`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #f1f5f9;">
          <h2 style="color: #6b21a8; margin: 0; font-size: 24px; font-weight: 800;">National Engineering College</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px; font-weight: 500;">Alumni Association & Award Committee</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%); border: 1px solid #d8b4fe; padding: 28px; border-radius: 16px; text-align: center; margin-bottom: 24px;">
          <span style="background-color: #16a34a; color: #ffffff; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1.2px; display: inline-block; margin-bottom: 14px;">Form Officially Open</span>
          <h3 style="color: #581c87; font-size: 22px; font-weight: 800; margin: 0 0 10px 0;">Distinguished Alumni Award Nominations</h3>
          <p style="color: #4c1d95; font-size: 14px; margin: 0 0 24px 0; line-height: 1.5;">
            The nomination window for this year's NEC Alumni Awards is now active. Click the button below to complete and submit your nomination.
          </p>
          
          <a href="${formUrl}" target="_blank" style="display: inline-block; background-color: #7e22ce; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(126, 34, 206, 0.35);">
            Fill Out Nomination Form &rarr;
          </a>
        </div>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="color: #334155; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">Direct Access Link:</p>
          <a href="${formUrl}" style="color: #7e22ce; font-size: 13px; word-break: break-all;">${formUrl}</a>
        </div>

        <p style="color: #475569; font-size: 13px; line-height: 1.6;">
          <strong>Note:</strong> Once the nomination period closes, this link will be automatically deactivated and will no longer accept submissions.
        </p>

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
        
        <p style="color: #94a3b8; font-size: 12px; text-align: left; line-height: 1.5;">
          Regards,<br />
          <strong>NEC Alumni Association</strong><br />
          National Engineering College, K.R. Nagar, Kovilpatti - 628 503
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from,
      to,
      subject: 'NEC Alumni Award Nomination Form is Now Open!',
      text: textContent,
      html: htmlContent,
    });

    console.log(`[SMTP SUCCESS]: Nomination form open email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('[SMTP ERROR]: Failed to send nomination form open email:', error.message);
    return { sent: false, error: error.message };
  }
};

const sendNomineeApprovalEmail = async (to, nomineeName, nominationId, approvalUrl) => {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'Alumni Portal <alumni@nec.edu>';
  const transporter = createTransporter();
  if (!transporter) return { sent: false, reason: 'SMTP credentials are not configured.' };
  try {
    await transporter.sendMail({
      from,
      to,
      subject: 'Please review your NEC Alumni Award nomination',
      text: `Hello ${nomineeName},\n\nThe NEC Alumni Association office has prepared nomination ${nominationId} for you. Please review and approve or decline it using this secure link (valid for 7 days):\n${approvalUrl}\n\nRegards,\nNEC Alumni Association`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#1e293b"><h2>NEC Alumni Award nomination</h2><p>Hello ${String(nomineeName).replace(/[&<>"']/g, '')},</p><p>The Alumni Association office has prepared nomination <strong>${String(nominationId).replace(/[&<>"']/g, '')}</strong> for you. Please review and approve or decline the nomination.</p><p><a href="${approvalUrl}" style="display:inline-block;padding:12px 18px;background:#6b21a8;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">Review nomination</a></p><p>This secure link expires in 7 days and can be used once.</p><p>Regards,<br/>NEC Alumni Association</p></div>`,
    });
    return { sent: true };
  } catch (error) {
    console.error('[SMTP ERROR] Nominee approval email failed:', error.message);
    return { sent: false, reason: error.message };
  }
};

module.exports = {
  isSMTPConfigured,
  verifySMTPConnection,
  sendOTPEmail,
  sendNominationFormOpenEmail,
  sendNomineeApprovalEmail,
};


