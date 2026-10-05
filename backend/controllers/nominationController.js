const Nomination = require('../models/Nomination');
const Counter = require('../models/Counter');
const Setting = require('../models/Setting');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { verifySignedToken } = require('../utils/signedToken');
const { sendNomineeApprovalEmail } = require('../utils/sendEmail');
const memberController = require('./memberController');
const { isServingCommitteeMember } = require('../config/committeeList');

// In-Memory Storage Fallback (used when local MongoDB server is not running)
const inMemoryNominations = new Map();
let inMemorySeq = 0;

const readNominationWindow = async () => {
  const setting = mongoose.connection.readyState === 1
    ? await Setting.findOne({ key: 'nominationWindow' }).lean()
    : null;
  const window = setting?.value || null;
  if (!window?.startAt || !window?.endAt) return { isOpen: false, startAt: null, endAt: null };
  const now = Date.now();
  const startAt = new Date(window.startAt).getTime();
  const endAt = new Date(window.endAt).getTime();
  return {
    isOpen: Number.isFinite(startAt) && Number.isFinite(endAt) && now >= startAt && now <= endAt,
    startAt: window.startAt,
    endAt: window.endAt,
  };
};

const nomineeHasWon = async (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (mongoose.connection.readyState === 1) {
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return Boolean(await Nomination.exists({ 'nominee.email': new RegExp(`^${escapedEmail}$`, 'i'), awardResult: { $in: ['Winner', 'Revoked'] } }));
  }
  return Array.from(new Set(inMemoryNominations.values())).some((item) =>
    String(item.nominee?.email || '').trim().toLowerCase() === normalizedEmail && ['Winner', 'Revoked'].includes(item.awardResult));
};

const nomineeWasNotAwardedWithinTwoYears = async (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const currentYear = new Date().getFullYear();
  let previous = null;
  if (mongoose.connection.readyState === 1) {
    previous = await Nomination.findOne({
      'nominee.email': new RegExp(`^${escapedEmail}$`, 'i'),
      awardResult: 'NotAwarded',
    }).sort({ awardYear: -1, createdAt: -1 }).select('awardYear').lean();
  } else {
    previous = Array.from(new Set(inMemoryNominations.values()))
      .filter((item) => String(item.nominee?.email || '').trim().toLowerCase() === normalizedEmail && item.awardResult === 'NotAwarded')
      .sort((left, right) => Number(right.awardYear || 0) - Number(left.awardYear || 0))[0];
  }
  return previous?.awardYear && currentYear - Number(previous.awardYear) < 2 ? Number(previous.awardYear) : null;
};

const hasRequiredCategoryDetails = (category, details = {}) => {
  if (!details.benefitImpact) return false;
  const requiredByCategory = {
    Business: ['businessType', 'position', 'employeeStrength', 'country'],
    Academic: ['institution', 'institutionSector', 'designation', 'staffCapacity', 'leadershipAchievement'],
    Scientific: ['organization', 'designation', 'sector', 'address', 'publications', 'patents'],
    Sports: ['organization', 'designation', 'level', 'achievement'],
    Social: ['trust', 'sector', 'level', 'address', 'achievement'],
    Political: ['trust', 'designation', 'level', 'address', 'achievement'],
    'Retired Service Personnel': ['serviceType', 'serviceNumber', 'rank', 'unit', 'branch', 'joiningDate', 'retirementDate', 'yearsOfService', 'serviceBook', 'exServiceId'],
  };
  const required = requiredByCategory[category];
  return Boolean(required && required.every((key) => details[key] !== undefined && details[key] !== null && String(details[key]).trim() !== ''));
};

// Create a new Nomination
exports.createNomination = async (req, res) => {
  try {
    const isBackOffice = req.isBackOffice === true;
    if (!isBackOffice) {
      const window = await readNominationWindow();
      if (!window.isOpen) return res.status(403).json({ success: false, message: 'The nomination period is currently closed.' });

      const verification = verifySignedToken(req.body.declaration?.verificationToken);
      const nomineeEmail = String(req.body.nominee?.email || '').trim().toLowerCase();
      if (!verification || verification.purpose !== 'nominee-email-verification' || verification.email !== nomineeEmail) {
        return res.status(403).json({ success: false, message: 'Verify the nominee email before submitting this nomination.' });
      }
    }

    const nomineeEmail = String(req.body.nominee?.email || '').trim().toLowerCase();
    if (!nomineeEmail) return res.status(400).json({ success: false, message: 'Nominee email is required.' });
    if (!['self', 'others'].includes(req.body.nominationType)) {
      return res.status(400).json({ success: false, message: 'Choose self-nomination or nomination by another alumnus.' });
    }
    if (!(await memberController.isKnownAlumniEmail(nomineeEmail))) {
      return res.status(400).json({ success: false, message: 'The nominee must be present in the NEC alumni records to meet the eligibility rules.' });
    }
    const nominatorEmail = String(req.body.nominator?.email || req.user?.email || '').trim().toLowerCase();
    if ([nomineeEmail, nominatorEmail, req.user?.email].some(isServingCommitteeMember)) {
      return res.status(403).json({ success: false, message: 'Serving Notable Alumni Committee members cannot be nominated or submit nominations.' });
    }
    if (await nomineeHasWon(nomineeEmail)) {
      return res.status(409).json({ success: false, message: 'This alumnus has already received the award and cannot be nominated again.' });
    }
    const notAwardedYear = await nomineeWasNotAwardedWithinTwoYears(nomineeEmail);
    if (notAwardedYear) {
      return res.status(409).json({
        success: false,
        message: `This nominee was not selected in ${notAwardedYear} and may reapply after two years.`,
      });
    }
    const declaration = req.body.declaration || {};
    if (!declaration.signature || !declaration.isDeclared) {
      return res.status(400).json({ success: false, message: 'A signed application and declaration are required.' });
    }
    if (!hasRequiredCategoryDetails(req.body.category, req.body.categoryDetails)) {
      return res.status(400).json({ success: false, message: 'Complete the category criteria and describe the impact of the nominee’s achievement.' });
    }
    const documents = req.body.documents || {};
    const requiredDocumentKeys = ['photos', 'identityProof', 'eligibilityProof', 'certificates', 'achievements', 'appreciationLetters', 'shortProfile'];
    const missingDocuments = requiredDocumentKeys.filter((key) => !Array.isArray(documents[key]) || documents[key].length < (key === 'photos' ? 2 : 1));
    if (req.body.nominationType === 'others') {
      ['nomineeDetails', 'nomineeConsent'].forEach((key) => {
        if (!Array.isArray(documents[key]) || documents[key].length < 1) missingDocuments.push(key);
      });
      if (!['Batch', 'Chapter', 'Fellow Alumni'].includes(req.body.nominator?.source)) {
        return res.status(400).json({ success: false, message: 'Choose whether this nomination is from a batch, chapter, or fellow alumnus.' });
      }
    }
    if (missingDocuments.length) {
      return res.status(400).json({ success: false, message: 'Upload all required application documents before submitting.' });
    }

    const currentYear = new Date().getFullYear();
    let nominationId;
    let savedNomination;
    const approvalToken = isBackOffice ? crypto.randomBytes(32).toString('hex') : null;
    const nominationData = { ...req.body };
    if (nominationData.declaration) {
      nominationData.declaration = { ...nominationData.declaration };
      delete nominationData.declaration.verificationToken;
      delete nominationData.declaration.verifiedEmail;
      delete nominationData.declaration.isOtpVerified;
    }
    nominationData.nominee.email = nomineeEmail;
    nominationData.createdBy = isBackOffice ? 'back-office' : 'applicant';
    nominationData.nomineeApprovalStatus = isBackOffice ? 'Pending' : 'NotRequired';
    nominationData.approvalTokenHash = approvalToken ? crypto.createHash('sha256').update(approvalToken).digest('hex') : '';
    nominationData.approvalTokenExpiresAt = approvalToken ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

    if (mongoose.connection.readyState === 1) {
      const counterId = `nomination_${currentYear}`;
      const counter = await Counter.findByIdAndUpdate(
        counterId,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const sequenceNumber = String(counter.seq).padStart(4, '0');
      nominationId = `NOM-${currentYear}-${sequenceNumber}`;

      const persistedData = {
        ...nominationData,
        nominationId,
        status: 'Submitted',
        awardResult: 'Undecided',
        awardYear: currentYear,
      };

      const nomination = new Nomination(persistedData);
      savedNomination = await nomination.save();
    } else {
      // In-Memory Mode
      inMemorySeq += 1;
      const sequenceNumber = String(inMemorySeq).padStart(4, '0');
      nominationId = `NOM-${currentYear}-${sequenceNumber}`;

      savedNomination = {
        _id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        ...nominationData,
        nominationId,
        status: 'Submitted',
        verificationStatus: 'Not Verified',
        awardResult: 'Undecided',
        awardYear: currentYear,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      inMemoryNominations.set(nominationId, savedNomination);
      inMemoryNominations.set(savedNomination._id, savedNomination);
      console.log(`[In-Memory Store] Submitted nomination saved with ID: ${nominationId}`);
    }

    let approvalEmailSent = false;
    if (isBackOffice && approvalToken) {
      const appUrl = process.env.APP_BASE_URL || process.env.NOMINATION_FORM_URL || 'http://localhost:3000';
      const result = await sendNomineeApprovalEmail(
        nomineeEmail,
        savedNomination.nominee?.name || 'Alumnus',
        nominationId,
        `${appUrl.replace(/\/$/, '')}/nomination/approval/${approvalToken}`
      );
      approvalEmailSent = result.sent;
    }

    res.status(201).json({
      success: true,
      message: isBackOffice
        ? (approvalEmailSent ? 'Nomination saved and approval email sent to the nominee.' : 'Nomination saved, but the approval email could not be sent. Configure SMTP and resend it from the admin dashboard.')
        : 'Nomination submitted successfully',
      approvalEmailSent,
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
      if (id.startsWith('NOM-')) {
        nomination = await Nomination.findOne({ nominationId: id });
      } else {
        nomination = await Nomination.findById(id);
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
      nomination = await Nomination.findById(id) || await Nomination.findOne({ nominationId: id });
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
      let nomination = await Nomination.findById(id) || await Nomination.findOne({ nominationId: id });
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
      { id: 'Sports', title: 'Cultural / Sports', description: 'Individual or group achievements in culture or sports representing a community, organization, state, or nation.' },
      { id: 'Social', title: 'Humanitarian & Social Leadership', description: 'Leadership benefiting children, women, peace, human rights, humanitarian work, voluntary service, and local communities.' },
      { id: 'Political', title: 'Political, Legal & Governmental Affairs', description: 'Achievements in political, legal, or governmental affairs, considered case by case.' },
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

exports.getAllNominations = async (req, res) => {
  try {
    const data = mongoose.connection.readyState === 1
      ? await Nomination.find().sort({ createdAt: -1 }).lean()
      : Array.from(new Set(inMemoryNominations.values())).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Could not load nominations.' });
  }
};

exports.verifyNomination = async (req, res) => {
  try {
    const { verificationStatus, rejectionReason = '', verifiedDocuments = [] } = req.body;
    if (!['Approved', 'Rejected'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Choose Approved or Rejected.' });
    }
    if (verificationStatus === 'Rejected' && !String(rejectionReason).trim()) {
      return res.status(400).json({ success: false, message: 'A rejection reason is required.' });
    }
    let nomination;
    if (mongoose.connection.readyState === 1) {
      nomination = await Nomination.findOne({
        $or: [{ _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }, { nominationId: req.params.id }],
      });
    } else {
      nomination = inMemoryNominations.get(req.params.id);
    }
    if (!nomination) return res.status(404).json({ success: false, message: 'Nomination not found.' });
    if (verificationStatus === 'Approved' && nomination.createdBy === 'back-office' && nomination.nomineeApprovalStatus !== 'Approved') {
      return res.status(409).json({ success: false, message: 'Wait for the nominee to approve the back-office nomination before verifying it.' });
    }
    if (verificationStatus === 'Approved') {
      const requiredUrls = Object.values(nomination.documents || {}).flat().filter(Boolean);
      if (!requiredUrls.length || !requiredUrls.every((url) => verifiedDocuments.includes(url))) {
        return res.status(409).json({ success: false, message: 'Verify every uploaded document before approving the nomination.' });
      }
    }
    Object.assign(nomination, { verificationStatus, rejectionReason, verifiedDocuments });
    if (mongoose.connection.readyState === 1) await nomination.save();
    return res.status(200).json({ success: true, message: 'Nomination verification updated.', data: nomination });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Could not update verification.' });
  }
};

exports.setAwardResult = async (req, res) => {
  try {
    const { awardResult, revocationReason = '' } = req.body;
    if (!['Undecided', 'Winner', 'NotAwarded', 'Revoked'].includes(awardResult)) {
      return res.status(400).json({ success: false, message: 'Choose Winner, NotAwarded, Revoked, or Undecided.' });
    }
    if (awardResult === 'Revoked' && !String(revocationReason).trim()) {
      return res.status(400).json({ success: false, message: 'A reason is required when revoking an award.' });
    }
    let nomination;
    if (mongoose.connection.readyState === 1) {
      const query = mongoose.isValidObjectId(req.params.id) ? { _id: req.params.id } : { nominationId: req.params.id };
      nomination = await Nomination.findOne(query);
      if (!nomination) return res.status(404).json({ success: false, message: 'Nomination not found.' });
      if (['Winner', 'Revoked'].includes(nomination.awardResult) && awardResult !== nomination.awardResult && awardResult !== 'Revoked') {
        return res.status(409).json({ success: false, message: 'A recorded winner must be revoked with a reason before the award status can change.' });
      }
      if (awardResult === 'Revoked' && nomination.awardResult !== 'Winner') {
        return res.status(409).json({ success: false, message: 'Only an existing winner award can be revoked.' });
      }
      if (awardResult === 'Winner' && nomination.verificationStatus !== 'Approved') {
        return res.status(409).json({ success: false, message: 'Only an approved nomination can be marked as an award winner.' });
      }
      if (awardResult === 'Winner' && nomination.reviewAssessment?.reviewers?.length !== 2) {
        return res.status(409).json({ success: false, message: 'Save both eligibility reviewer assessments before selecting an award winner.' });
      }
      if (awardResult === 'Winner' && nomination.reviewAssessment.reviewers.some((reviewer) => reviewer.recommendation !== 'Recommend')) {
        return res.status(409).json({ success: false, message: 'Both reviewers must recommend the nominee before selecting an award winner.' });
      }
      nomination.awardResult = awardResult;
      nomination.awardRevocationReason = awardResult === 'Revoked' ? String(revocationReason).trim() : '';
      nomination.awardYear = Number(req.body.awardYear) || nomination.awardYear || new Date().getFullYear();
      await nomination.save();
    } else {
      nomination = inMemoryNominations.get(req.params.id);
      if (!nomination) return res.status(404).json({ success: false, message: 'Nomination not found.' });
      if (['Winner', 'Revoked'].includes(nomination.awardResult) && awardResult !== nomination.awardResult && awardResult !== 'Revoked') {
        return res.status(409).json({ success: false, message: 'A recorded winner must be revoked with a reason before the award status can change.' });
      }
      if (awardResult === 'Revoked' && nomination.awardResult !== 'Winner') {
        return res.status(409).json({ success: false, message: 'Only an existing winner award can be revoked.' });
      }
      if (awardResult === 'Winner' && nomination.verificationStatus !== 'Approved') {
        return res.status(409).json({ success: false, message: 'Only an approved nomination can be marked as an award winner.' });
      }
      if (awardResult === 'Winner' && nomination.reviewAssessment?.reviewers?.length !== 2) {
        return res.status(409).json({ success: false, message: 'Save both eligibility reviewer assessments before selecting an award winner.' });
      }
      if (awardResult === 'Winner' && nomination.reviewAssessment.reviewers.some((reviewer) => reviewer.recommendation !== 'Recommend')) {
        return res.status(409).json({ success: false, message: 'Both reviewers must recommend the nominee before selecting an award winner.' });
      }
      Object.assign(nomination, {
        awardResult,
        awardRevocationReason: awardResult === 'Revoked' ? String(revocationReason).trim() : '',
        awardYear: Number(req.body.awardYear) || nomination.awardYear || new Date().getFullYear()
      });
    }
    return res.status(200).json({ success: true, message: 'Award result updated.', data: nomination });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Could not update award result.' });
  }
};

exports.saveReviewAssessment = async (req, res) => {
  try {
    const reviewers = req.body.reviewers;
    if (!Array.isArray(reviewers) || reviewers.length !== 2) {
      return res.status(400).json({ success: false, message: 'Enter assessments from both reviewers.' });
    }
    const scoreKeys = ['general', 'categoryBased', 'awards', 'contribution', 'others'];
    const normalizedReviewers = reviewers.map((reviewer) => {
      const scores = {};
      scoreKeys.forEach((key) => {
        const value = Number(reviewer.scores?.[key]);
        if (!Number.isInteger(value) || value < 0 || value > 5) throw new Error('Each review score must be between 0 and 5.');
        scores[key] = value;
      });
      if (!String(reviewer.name || '').trim() || !['Recommend', 'Do not recommend'].includes(reviewer.recommendation)) {
        throw new Error('Each reviewer must enter their name and recommendation.');
      }
      return { name: String(reviewer.name).trim(), scores, recommendation: reviewer.recommendation };
    });
    if (normalizedReviewers[0].name.toLowerCase() === normalizedReviewers[1].name.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'The two assessments must be from different reviewers.' });
    }
    const totals = normalizedReviewers.map(({ scores }) => Object.values(scores).reduce((sum, value) => sum + value, 0));
    const reviewAssessment = { reviewers: normalizedReviewers, reviewerTotals: totals, totalPoints: Math.round(totals.reduce((sum, value) => sum + value, 0) / 2), updatedAt: new Date().toISOString() };
    let nomination;
    if (mongoose.connection.readyState === 1) {
      nomination = await Nomination.findOneAndUpdate(
        { $or: [{ _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }, { nominationId: req.params.id }] },
        { reviewAssessment }, { new: true, runValidators: true }
      );
    } else {
      nomination = inMemoryNominations.get(req.params.id);
      if (nomination) Object.assign(nomination, { reviewAssessment, updatedAt: new Date().toISOString() });
    }
    if (!nomination) return res.status(404).json({ success: false, message: 'Nomination not found.' });
    return res.status(200).json({ success: true, message: 'Two-reviewer eligibility assessment saved.', data: nomination });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || 'Could not save review assessment.' });
  }
};

exports.getNominationWindow = async (req, res) => {
  try {
    return res.status(200).json(await readNominationWindow());
  } catch {
    return res.status(200).json({ isOpen: false, startAt: null, endAt: null });
  }
};

exports.setNominationWindow = async (req, res) => {
  try {
    const startAt = new Date(req.body.startAt);
    const endAt = new Date(req.body.endAt);
    if (!req.body.startAt || !req.body.endAt || !Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || startAt >= endAt) {
      return res.status(400).json({ success: false, message: 'Provide a valid opening and closing date/time, with closing after opening.' });
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Nomination schedule needs a database connection to persist.' });
    }
    const window = { startAt: startAt.toISOString(), endAt: endAt.toISOString() };
    await Setting.findOneAndUpdate(
      { key: 'nominationWindow' },
      { key: 'nominationWindow', value: window },
      { upsert: true, new: true, runValidators: true }
    );
    const state = await readNominationWindow();
    return res.status(200).json({ success: true, ...state, message: 'Nomination opening and closing times saved.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Could not save nomination schedule.' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const data = mongoose.connection.readyState === 1
      ? await Nomination.find({ awardResult: 'Winner' }).sort({ awardYear: -1, createdAt: -1 }).lean()
      : Array.from(new Set(inMemoryNominations.values())).filter((item) => item.awardResult === 'Winner');
    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, message: 'Could not load award winners.' });
  }
};

exports.respondToNomineeApproval = async (req, res) => {
  try {
    const { decision } = req.body;
    if (!['approve', 'decline'].includes(decision)) return res.status(400).json({ success: false, message: 'Choose approve or decline.' });
    const tokenHash = crypto.createHash('sha256').update(String(req.params.token)).digest('hex');
    let nomination;
    if (mongoose.connection.readyState === 1) {
      nomination = await Nomination.findOne({ approvalTokenHash: tokenHash, nomineeApprovalStatus: 'Pending' });
      if (nomination && new Date(nomination.approvalTokenExpiresAt).getTime() >= Date.now()) {
        nomination.nomineeApprovalStatus = decision === 'approve' ? 'Approved' : 'Declined';
        nomination.approvalTokenHash = '';
        nomination.approvalTokenExpiresAt = null;
        await nomination.save();
      } else nomination = null;
    } else {
      nomination = Array.from(new Set(inMemoryNominations.values())).find((item) => item.approvalTokenHash === tokenHash && item.nomineeApprovalStatus === 'Pending');
      if (nomination && new Date(nomination.approvalTokenExpiresAt).getTime() >= Date.now()) {
        Object.assign(nomination, {
          nomineeApprovalStatus: decision === 'approve' ? 'Approved' : 'Declined',
          approvalTokenHash: '',
          approvalTokenExpiresAt: null,
        });
      } else nomination = null;
    }
    if (!nomination) return res.status(410).json({ success: false, message: 'This approval link is invalid, already used, or expired. Contact the Alumni Association office.' });
    return res.status(200).json({ success: true, message: decision === 'approve' ? 'You approved this nomination.' : 'You declined this nomination.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Could not save your response.' });
  }
};

exports.getNomineeApproval = async (req, res) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(String(req.params.token)).digest('hex');
    let nomination = mongoose.connection.readyState === 1
      ? await Nomination.findOne({ approvalTokenHash: tokenHash, nomineeApprovalStatus: 'Pending' }).lean()
      : Array.from(new Set(inMemoryNominations.values())).find((item) => item.approvalTokenHash === tokenHash && item.nomineeApprovalStatus === 'Pending');
    if (!nomination || new Date(nomination.approvalTokenExpiresAt).getTime() < Date.now()) {
      return res.status(410).json({ success: false, message: 'This approval link is invalid, already used, or expired.' });
    }
    const { nominee, professional, category, categoryDetails, necContribution, nominationId } = nomination;
    return res.status(200).json({ success: true, data: { nominationId, nominee, professional, category, categoryDetails, necContribution } });
  } catch {
    return res.status(500).json({ success: false, message: 'Could not load nomination details.' });
  }
};

exports.resendNomineeApproval = async (req, res) => {
  try {
    const query = mongoose.isValidObjectId(req.params.id) ? { _id: req.params.id } : { nominationId: req.params.id };
    let nomination = mongoose.connection.readyState === 1
      ? await Nomination.findOne(query)
      : inMemoryNominations.get(req.params.id);
    if (!nomination || nomination.createdBy !== 'back-office' || nomination.nomineeApprovalStatus !== 'Pending') {
      return res.status(404).json({ success: false, message: 'No pending back-office approval was found.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    nomination.approvalTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    nomination.approvalTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (typeof nomination.save === 'function') await nomination.save();
    const appUrl = process.env.APP_BASE_URL || process.env.NOMINATION_FORM_URL || 'http://localhost:3000';
    const result = await sendNomineeApprovalEmail(
      nomination.nominee.email,
      nomination.nominee.name || 'Alumnus',
      nomination.nominationId,
      `${appUrl.replace(/\/$/, '')}/nomination/approval/${token}`
    );
    if (!result.sent) return res.status(503).json({ success: false, message: 'Approval email could not be sent. Check SMTP configuration.' });
    return res.status(200).json({ success: true, message: 'Nominee approval email sent.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Could not resend approval email.' });
  }
};
