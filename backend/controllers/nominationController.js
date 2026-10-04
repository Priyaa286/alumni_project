const Nomination = require('../models/Nomination');
const Counter = require('../models/Counter');
const Setting = require('../models/Setting');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { sendNominationFormOpenEmail } = require('../utils/sendEmail');

// In-Memory Storage Fallback (used when local MongoDB server is not running)
const inMemoryNominations = new Map();
let inMemorySeq = 0;
let inMemoryFormOpen = true; // Default form open status

// Create a new Nomination
exports.createNomination = async (req, res) => {
  try {
    // Check if Nomination Form is Open
    let isOpen = inMemoryFormOpen;
    if (mongoose.connection.readyState === 1) {
      const formSetting = await Setting.findOne({ key: 'nomination_form_open' });
      if (formSetting !== null && formSetting !== undefined) {
        isOpen = Boolean(formSetting.value);
      }
    }

    if (!isOpen) {
      return res.status(403).json({
        success: false,
        message: 'The nomination form is currently closed by the Admin. Submissions are no longer accepted.'
      });
    }

    const nomineeEmail = (req.body.nominee?.email || req.body.email || '').trim().toLowerCase();

    const nomineeMobile = (req.body.nominee?.mobile || req.body.mobile || '').trim();
    const nomineeName = (req.body.nominee?.name || req.body.nominee?.fullName || req.body.nomineeName || '').trim().toLowerCase();

    // Check for duplicate nomination entry
    if (mongoose.connection.readyState === 1) {
      const orConditions = [];
      if (nomineeEmail) orConditions.push({ 'nominee.email': nomineeEmail }, { email: nomineeEmail });
      if (nomineeMobile) orConditions.push({ 'nominee.mobile': nomineeMobile }, { mobile: nomineeMobile });
      if (nomineeName) {
        orConditions.push({ 'nominee.name': { $regex: new RegExp(`^${nomineeName}$`, 'i') } });
        orConditions.push({ 'nominee.fullName': { $regex: new RegExp(`^${nomineeName}$`, 'i') } });
        orConditions.push({ nomineeName: { $regex: new RegExp(`^${nomineeName}$`, 'i') } });
      }

      if (orConditions.length > 0) {
        const existingNomination = await Nomination.findOne({ $or: orConditions });
        if (existingNomination) {
          return res.status(400).json({
            success: false,
            message: 'A nomination for this nominee has already been submitted. Duplicate entries are not allowed.'
          });
        }
      }
    }

    // Check in-memory store for duplicate
    for (const item of inMemoryNominations.values()) {
      if (!item) continue;
      const existingEmail = (item.nominee?.email || item.email || '').trim().toLowerCase();
      const existingMobile = (item.nominee?.mobile || item.mobile || '').trim();
      const existingName = (item.nominee?.name || item.nominee?.fullName || item.nomineeName || '').trim().toLowerCase();

      if (
        (nomineeEmail && existingEmail && nomineeEmail === existingEmail) ||
        (nomineeMobile && existingMobile && nomineeMobile === existingMobile) ||
        (nomineeName && existingName && nomineeName === existingName)
      ) {
        return res.status(400).json({
          success: false,
          message: 'A nomination for this nominee has already been submitted. Duplicate entries are not allowed.'
        });
      }
    }

    const currentYear = new Date().getFullYear();
    let nominationId;
    let savedNomination;

    if (mongoose.connection.readyState === 1) {
      const counterId = `nomination_${currentYear}`;
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const sequenceNumber = String(counter.seq).padStart(4, '0');
      nominationId = `NOM-${currentYear}-${sequenceNumber}`;

      const nominationData = {
        ...req.body,
        nominationId,
        status: 'Submitted'
      };

      const nomination = new Nomination(nominationData);
      savedNomination = await nomination.save();
      console.log(`[MongoDB Atlas] Nomination saved successfully with ID: ${nominationId}`);

      // Sync into in-memory store so admin fetch retrieves it instantaneously
      inMemoryNominations.set(nominationId, savedNomination.toObject ? savedNomination.toObject() : savedNomination);
      if (savedNomination._id) {
        inMemoryNominations.set(String(savedNomination._id), savedNomination.toObject ? savedNomination.toObject() : savedNomination);
      }
    } else {
      // In-Memory Mode
      inMemorySeq += 1;
      const sequenceNumber = String(inMemorySeq).padStart(4, '0');
      nominationId = `NOM-${currentYear}-${sequenceNumber}`;

      savedNomination = {
        _id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        ...req.body,
        nominationId,
        status: 'Submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      inMemoryNominations.set(nominationId, savedNomination);
      inMemoryNominations.set(savedNomination._id, savedNomination);
      console.log(`[In-Memory Store] Submitted nomination saved with ID: ${nominationId}`);
    }

    // Mock Email/SMS placeholders
    if (savedNomination.nominee?.email) {
      console.log(`[Notification] Sending Confirmation Email to Nominee: ${savedNomination.nominee.email} for ID: ${nominationId}`);
    }
    if (savedNomination.nominee?.mobile) {
      console.log(`[Notification] Sending Confirmation SMS to Nominee: ${savedNomination.nominee.mobile} for ID: ${nominationId}`);
    }
    if (savedNomination.nominator?.email) {
      console.log(`[Notification] Sending Acknowledgment Email to Nominator: ${savedNomination.nominator.email}`);
    }

    res.status(201).json({
      success: true,
      message: 'Nomination submitted successfully',
      data: savedNomination
    });
  } catch (error) {
    console.error('Error creating nomination:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit nomination'
    });
  }
};

// Get a Nomination by Custom Nomination ID or MongoDB ObjectId
exports.getNominationById = async (req, res) => {
  try {
    const { id } = req.params;
    let nomination = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        nomination = await Nomination.findById(id);
      }
      if (!nomination) {
        nomination = await Nomination.findOne({ nominationId: id });
      }
    } else {
      nomination = inMemoryNominations.get(id) || null;
    }

    if (!nomination) {
      return res.status(404).json({
        success: false,
        message: 'Nomination not found'
      });
    }

    res.status(200).json({
      success: true,
      data: nomination
    });
  } catch (error) {
    console.error('Error fetching nomination:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch nomination'
    });
  }
};

// Update a Nomination (Useful for drafts or corrections)
exports.updateNomination = async (req, res) => {
  try {
    const { id } = req.params;
    let nomination = null;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        nomination = await Nomination.findById(id);
      }
      if (!nomination) {
        nomination = await Nomination.findOne({ nominationId: id });
      }
      if (!nomination) {
        return res.status(404).json({ success: false, message: 'Nomination not found' });
      }

      nomination = await Nomination.findByIdAndUpdate(
        nomination._id,
        req.body,
        { new: true, runValidators: true }
      );
    } else {
      nomination = inMemoryNominations.get(id);
      if (!nomination) {
        return res.status(404).json({ success: false, message: 'Nomination not found' });
      }
      Object.assign(nomination, req.body, { updatedAt: new Date().toISOString() });
    }

    res.status(200).json({
      success: true,
      message: 'Nomination updated successfully',
      data: nomination
    });
  } catch (error) {
    console.error('Error updating nomination:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update nomination'
    });
  }
};

// Delete a Nomination
exports.deleteNomination = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      let nomination = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        nomination = await Nomination.findById(id);
      }
      if (!nomination) {
        nomination = await Nomination.findOne({ nominationId: id });
      }
      if (!nomination) {
        return res.status(404).json({ success: false, message: 'Nomination not found' });
      }
      await Nomination.findByIdAndDelete(nomination._id);
    } else {
      const nomination = inMemoryNominations.get(id);
      if (!nomination) {
        return res.status(404).json({ success: false, message: 'Nomination not found' });
      }
      inMemoryNominations.delete(nomination.nominationId);
      inMemoryNominations.delete(nomination._id);
    }

    res.status(200).json({
      success: true,
      message: 'Nomination deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting nomination:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete nomination'
    });
  }
};

// Get Award Categories list (Step 3 static configuration endpoint)
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { id: 'Business', title: 'Business', description: 'Entrepreneurs, founders, and corporate leaders making exceptional business impact.' },
      { id: 'Academic', title: 'Academic', description: 'Scholars, professors, and researchers driving excellence in education.' },
      { id: 'Scientific', title: 'Scientific', description: 'Scientists and innovators breaking frontiers in technology and science.' },
      { id: 'Sports', title: 'Sports', description: 'Athletes and coaches representing at state, national, or international levels.' },
      { id: 'Social', title: 'Social', description: 'Individuals dedicating efforts to community welfare, NGOs, and social service.' },
      { id: 'Political', title: 'Political', description: 'Leaders contributing to public administration, governance, and policy.' },
      { id: 'Retired Service Personnel', title: 'Retired Service Personnel', description: 'Veterans from Army, Navy, Air Force, and CAPF who served the nation.' }
    ];

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories'
    });
  }
};

// Get All Nominations (Admin Dashboard endpoint)
exports.getAllNominations = async (req, res) => {
  try {
    let dbNominations = [];
    if (mongoose.connection.readyState === 1) {
      dbNominations = await Nomination.find().sort({ createdAt: -1 });
    }

    const memNominations = Array.from(inMemoryNominations.values());

    // Merge DB records and Memory records deduplicated by nominee email / name
    const combined = [...dbNominations, ...memNominations];
    const map = new Map();
    combined.forEach(item => {
      if (!item) return;
      const email = (item.nominee?.email || item.email || '').trim().toLowerCase();
      const name = (item.nominee?.name || item.nominee?.fullName || item.nomineeName || '').trim().toLowerCase();
      const key = email || name || item.nominationId || String(item._id);
      if (!map.has(key)) {
        map.set(key, item.toObject ? item.toObject() : item);
      }
    });

    const nominations = Array.from(map.values());

    return res.status(200).json({
      success: true,
      count: nominations.length,
      data: nominations
    });
  } catch (error) {
    console.error('Error fetching nominations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve nominations'
    });
  }
};

// Helper to calculate score for Leaderboard ranking
const calculateNomineeScore = (data) => {
  let score = 0;
  // 1. Contribution activities count (25 pts per activity)
  const activities = data.necContribution?.activities || [];
  score += activities.length * 25;

  // 2. Additional contribution details length bonus
  const details = data.necContribution?.details || '';
  if (details.length > 50) score += 15;
  if (details.length > 150) score += 15;

  // 3. Work Experience (5 pts per year, max 100 pts)
  const expStr = data.professional?.experience || '0';
  const expYears = parseInt(expStr, 10);
  if (!isNaN(expYears)) {
    score += Math.min(expYears * 5, 100);
  }

  // 4. Verified Documents bonus (15 pts per verified doc)
  const verifiedDocs = data.verifiedDocuments || [];
  score += verifiedDocs.length * 15;

  // 5. Registered Alumni Bonus (20 pts)
  if (data.nominee?.isRegisteredAlumni === 'Yes') {
    score += 20;
  }

  return score;
};

// Helper to send decision email notification
const sendDecisionEmail = async (nomineeEmail, nomineeName, decision, rejectionReason = '') => {
  if (!nomineeEmail) return;

  try {
    let transporter = null;
    let from = `"NEC Alumni Association" <no-reply@nec.edu.in>`;

    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      const gmailUser = process.env.GMAIL_USER.trim();
      const gmailPass = process.env.GMAIL_PASS.replace(/\s+/g, '');
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: gmailUser, pass: gmailPass },
      });
      from = `"NEC Alumni Association" <${gmailUser}>`;
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST.trim(),
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER.trim(), pass: process.env.SMTP_PASS.trim() },
      });
      from = process.env.SMTP_FROM || `"NEC Alumni Association" <${process.env.SMTP_USER.trim()}>`;
    }

    if (!transporter) {
      console.log(`[DECISION MAIL LOG] Mail for: ${nomineeEmail} | Decision: ${decision}`);
      return;
    }

    if (decision === 'Approved') {
      await transporter.sendMail({
        from,
        to: nomineeEmail,
        subject: 'Congratulations! Your Details Verified - NEC Notable Alumni Award',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #8A2BE2; text-align: center; margin-bottom: 8px;">NATIONAL ENGINEERING COLLEGE</h2>
            <p style="text-align: center; color: #64748b; font-size: 13px; margin-top: 0;">NOTABLE ALUMNI AWARD PORTAL</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 16px; color: #1e293b;">Dear <strong>${nomineeName}</strong>,</p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #166534; margin: 0 0 8px 0; font-size: 16px;">🎉 Nomination Details Verified & Approved!</h3>
              <p style="color: #15803d; font-size: 14px; margin: 0; line-height: 1.5;">
                Your details are successfully verified and You're eligible for ranking in the Notable Alumni Award Leaderboard!
              </p>
            </div>
            <p style="font-size: 14px; color: #475569;">
              Thank you for your outstanding professional accomplishments and invaluable contributions to National Engineering College.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              National Engineering College, K.R. Nagar, Kovilpatti - 628 503
            </p>
          </div>
        `,
      });
      console.log(`[APPROVAL EMAIL SENT] Sent approval email to ${nomineeEmail}`);
    } else if (decision === 'Rejected') {
      await transporter.sendMail({
        from,
        to: nomineeEmail,
        subject: 'Update on Your Nomination - NEC Notable Alumni Award',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #8A2BE2; text-align: center; margin-bottom: 8px;">NATIONAL ENGINEERING COLLEGE</h2>
            <p style="text-align: center; color: #64748b; font-size: 13px; margin-top: 0;">NOTABLE ALUMNI AWARD PORTAL</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 16px; color: #1e293b;">Dear <strong>${nomineeName}</strong>,</p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Thank you for submitting your nomination details for the Notable Alumni Award.
            </p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              After careful review of your submitted documents and records, we regret to inform you that your nomination could not be approved at this time.
            </p>
            <div style="background-color: #fff1f2; border: 1px solid #fecdd3; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #9f1239; margin: 0 0 6px 0; font-size: 14px;">Reason for Rejection / Disqualification:</h4>
              <p style="color: #be123c; font-size: 13px; margin: 0; font-weight: 600;">
                ${rejectionReason || 'Submitted documents or details could not be verified against the official records.'}
              </p>
            </div>
            <p style="font-size: 14px; color: #475569;">
              We sincerely appreciate your participation and continued engagement with National Engineering College.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              National Engineering College, K.R. Nagar, Kovilpatti - 628 503
            </p>
          </div>
        `,
      });
      console.log(`[REJECTION EMAIL SENT] Sent rejection email to ${nomineeEmail}`);
    }
  } catch (err) {
    console.error('Error sending decision email:', err);
  }
};

// Admin Verify Endpoint (Approve / Reject)
exports.verifyNomination = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, rejectionReason, verifiedDocuments } = req.body;

    if (!['Approved', 'Rejected'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'verificationStatus must be Approved or Rejected'
      });
    }

    let updatedItem = null;

    if (mongoose.connection.readyState === 1) {
      let nomination = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        nomination = await Nomination.findById(id);
      }
      if (!nomination) {
        nomination = await Nomination.findOne({ nominationId: id });
      }

      if (nomination) {
        nomination.verificationStatus = verificationStatus;
        nomination.status = verificationStatus;
        nomination.rejectionReason = rejectionReason || '';
        nomination.verifiedDocuments = verifiedDocuments || [];
        nomination.score = calculateNomineeScore(nomination);
        updatedItem = await nomination.save();
        inMemoryNominations.set(String(updatedItem._id), updatedItem.toObject());
        if (updatedItem.nominationId) {
          inMemoryNominations.set(updatedItem.nominationId, updatedItem.toObject());
        }
      }
    }

    if (!updatedItem) {
      // In-Memory map lookup
      let item = inMemoryNominations.get(id);
      if (!item) {
        for (const [k, v] of inMemoryNominations.entries()) {
          if (v._id === id || v.nominationId === id) {
            item = v;
            break;
          }
        }
      }

      if (item) {
        item.verificationStatus = verificationStatus;
        item.status = verificationStatus;
        item.rejectionReason = rejectionReason || '';
        item.verifiedDocuments = verifiedDocuments || [];
        item.score = calculateNomineeScore(item);
        item.updatedAt = new Date().toISOString();
        inMemoryNominations.set(id, item);
        if (item._id) inMemoryNominations.set(String(item._id), item);
        if (item.nominationId) inMemoryNominations.set(item.nominationId, item);
        updatedItem = item;
      }
    }

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: 'Nomination not found'
      });
    }

    // Trigger real-time email notification (non-blocking)
    const recipientEmail = updatedItem.nominee?.email || updatedItem.email || updatedItem.nominator?.email;
    const nomineeName = updatedItem.nominee?.name || updatedItem.nominee?.fullName || updatedItem.nomineeName || 'Alumni';

    sendDecisionEmail(recipientEmail, nomineeName, verificationStatus, rejectionReason).catch(err => {
      console.error('Non-blocking decision email warning:', err);
    });

    return res.status(200).json({
      success: true,
      message: `Nomination marked as ${verificationStatus} and email notification triggered.`,
      data: updatedItem
    });
  } catch (error) {
    console.error('Error verifying nomination:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update verification status: ' + (error.message || error)
    });
  }
};

// Leaderboard Endpoint - Returns ranked approved candidates
exports.getLeaderboard = async (req, res) => {
  try {
    let approvedItems = [];

    if (mongoose.connection.readyState === 1) {
      approvedItems = await Nomination.find({
        $or: [
          { verificationStatus: 'Approved' },
          { status: 'Approved' }
        ]
      }).lean();
    }

    // Merge in-memory approved items as well
    const memMap = new Map();
    approvedItems.forEach(item => {
      if (item) {
        const key = item.nominationId || String(item._id);
        memMap.set(key, item);
      }
    });

    for (const item of inMemoryNominations.values()) {
      if (!item) continue;
      if (item.verificationStatus === 'Approved' || item.status === 'Approved') {
        const key = item.nominationId || String(item._id);
        if (!memMap.has(key)) {
          memMap.set(key, item);
        }
      }
    }

    const allApproved = Array.from(memMap.values());

    // Calculate score & sort by score descending
    const scoredList = allApproved.map((item) => {
      const computedScore = item.score && item.score > 0 ? item.score : calculateNomineeScore(item);
      return {
        ...item,
        score: computedScore
      };
    });

    scoredList.sort((a, b) => b.score - a.score);

    // Assign rank 1, 2, 3...
    const leaderboard = scoredList.map((item, index) => ({
      rank: index + 1,
      ...item
    }));

    return res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard'
    });
  }
};

// Get Nomination Form Opening/Closing Status (Public)
exports.getNominationStatus = async (req, res) => {
  try {
    let isOpen = inMemoryFormOpen;
    if (mongoose.connection.readyState === 1) {
      const setting = await Setting.findOne({ key: 'nomination_form_open' });
      if (setting !== null && setting !== undefined) {
        isOpen = Boolean(setting.value);
      }
    }
    return res.status(200).json({
      success: true,
      isOpen
    });
  } catch (error) {
    console.error('Error fetching nomination status:', error);
    return res.status(500).json({
      success: false,
      isOpen: inMemoryFormOpen,
      message: 'Failed to fetch nomination status'
    });
  }
};

// Toggle Nomination Form Opening/Closing Status (Admin Only)
exports.toggleNominationStatus = async (req, res) => {
  try {
    const { isOpen } = req.body;
    const targetStatus = Boolean(isOpen);
    inMemoryFormOpen = targetStatus;

    if (mongoose.connection.readyState === 1) {
      await Setting.findOneAndUpdate(
        { key: 'nomination_form_open' },
        { value: targetStatus },
        { upsert: true, new: true }
      );
    }

    let emailResult = null;
    // If Admin opens the nomination form, send email notification to praga007thija@gmail.com
    if (targetStatus) {
      const origin = req.headers.origin || req.headers.referer || 'http://localhost:5173';
      const cleanOrigin = origin.replace(/\/$/, '');
      const formUrl = `${cleanOrigin}/nomination`;
      
      const recipientEmail = 'praga007thija@gmail.com';
      console.log(`[Admin Action] Opening Nomination Form and sending announcement email to ${recipientEmail} with form URL: ${formUrl}`);
      emailResult = await sendNominationFormOpenEmail(recipientEmail, formUrl);
    }

    return res.status(200).json({
      success: true,
      isOpen: targetStatus,
      emailResult,
      message: targetStatus
        ? `Nomination form opened successfully.${emailResult?.sent ? ' Email notification sent to praga007thija@gmail.com.' : ' Email notification triggered.'}`
        : 'Nomination form closed successfully. The form link is now deactivated for new submissions.'
    });
  } catch (error) {
    console.error('Error toggling nomination status:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update nomination status'
    });
  }
};



