const mongoose = require('mongoose');

const NominationSchema = new mongoose.Schema({
  nominationId: {
    type: String,
    unique: true
  },
  nominee: {
    name: { type: String, required: true },
    batch: { type: String, required: true },
    department: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    linkedin: { type: String },
    isRegisteredAlumni: { type: String, enum: ['Yes', 'No'], required: true }
  },
  nominationType: {
    type: String,
    enum: ['self', 'others'],
    default: 'self'
  },
  professional: {
    designation: { type: String, required: true },
    organization: { type: String, required: true },
    experience: { type: String, required: true },
    skills: [{ type: String }],
    industries: [{ type: String }],
    workHistory: [{ type: mongoose.Schema.Types.Mixed }],
    website: { type: String },
    profileSummary: { type: String, required: true }
  },
  category: {
    type: String,
    required: true,
    enum: ['Business', 'Academic', 'Scientific', 'Sports', 'Social', 'Political', 'Retired Service Personnel']
  },
  categoryDetails: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  necContribution: {
    activities: [{ type: String }],
    details: { type: String, required: true }
  },
  documents: {
    photos: [{ type: String }],
    identityProof: [{ type: String }],
    eligibilityProof: [{ type: String }],
    appreciationLetters: [{ type: String }],
    shortProfile: [{ type: String }],
    nomineeDetails: [{ type: String }],
    nomineeConsent: [{ type: String }],
    certificates: [{ type: String }],
    achievements: [{ type: String }],
    organizationProfile: [{ type: String }],
    patents: [{ type: String }],
    publications: [{ type: String }],
    necAlumniCertificate: [{ type: String }],
    otherDocuments: [{ type: String }],
    serviceBook: [{ type: String }], // Specifically for Retired Service
    exServiceId: [{ type: String }]    // Specifically for Retired Service
  },
  nominator: {
    name: { type: String, required: true },
    source: { type: String, enum: ['Batch', 'Chapter', 'Fellow Alumni'] },
    batch: { type: String },
    department: { type: String },
    mobile: { type: String, required: true },
    email: { type: String, required: true }
  },
  declaration: {
    isDeclared: { type: Boolean, required: true },
    nomineeName: { type: String, required: true },
    date: { type: Date, required: true },
    place: { type: String, required: true },
    signature: { type: String, required: true } // Base64 data URL representing the signature
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted'],
    default: 'Submitted'
  },
  verificationStatus: {
    type: String,
    enum: ['Not Verified', 'Approved', 'Rejected'],
    default: 'Not Verified'
  },
  rejectionReason: { type: String, default: '' },
  verifiedDocuments: [{ type: String }],
  awardResult: {
    type: String,
    enum: ['Undecided', 'Winner', 'NotAwarded', 'Revoked'],
    default: 'Undecided'
  },
  awardRevocationReason: { type: String, default: '' },
  reviewAssessment: { type: mongoose.Schema.Types.Mixed, default: null },
  awardYear: { type: Number, default: () => new Date().getFullYear() },
  createdBy: { type: String, enum: ['applicant', 'back-office'], default: 'applicant' },
  nomineeApprovalStatus: {
    type: String,
    enum: ['NotRequired', 'Pending', 'Approved', 'Declined'],
    default: 'NotRequired'
  },
  approvalTokenHash: { type: String, default: '' },
  approvalTokenExpiresAt: { type: Date, default: null }
}, {
  timestamps: true
});

NominationSchema.index({ 'nominee.email': 1, awardResult: 1 });
NominationSchema.index({ approvalTokenHash: 1 }, { sparse: true });

module.exports = mongoose.model('Nomination', NominationSchema);
