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
    isOtpVerified: { type: Boolean, default: false },
    signature: { type: String } // Retained as optional for backward compatibility
  },
  verificationStatus: {
    type: String,
    enum: ['Not Verified', 'Approved', 'Rejected'],
    default: 'Not Verified'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  verifiedDocuments: [{
    type: String
  }],
  score: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected'],
    default: 'Submitted'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Nomination', NominationSchema);
