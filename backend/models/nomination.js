import mongoose from 'mongoose';

const supportingDocumentSchema = new mongoose.Schema({
  fieldName: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true }
});

const nominationSchema = new mongoose.Schema(
  {
    nominationId: {
      type: String,
      unique: true,
      required: true
    },
    nomineeDetails: {
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
      registeredInPortal: { type: String, enum: ['Yes', 'No'], required: true }
    },
    professionalProfile: {
      designation: { type: String, required: true },
      organization: { type: String, required: true },
      experience: { type: Number, required: true },
      website: { type: String },
      profileSummary: { type: String, required: true }
    },
    awardCategory: {
      type: String,
      required: true,
      enum: [
        'Business',
        'Academic',
        'Scientific',
        'Sports',
        'Social',
        'Political',
        'Retired Service'
      ]
    },
    categoryDetails: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    necContribution: {
      activities: [{ type: String }],
      details: { type: String, required: true }
    },
    supportingDocuments: [supportingDocumentSchema],
    nominatorDetails: {
      name: { type: String, required: true },
      batch: { type: String, required: true },
      department: { type: String, required: true },
      mobile: { type: String, required: true },
      email: { type: String, required: true }
    },
    declaration: {
      declared: { type: Boolean, required: true, default: false },
      nomineeName: { type: String, required: true },
      date: { type: Date, required: true },
      place: { type: String, required: true },
      signature: { type: String, required: true } // Base64 representation of digital signature canvas
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

// Format schema output
nominationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  }
});

const Nomination = mongoose.model('Nomination', nominationSchema);
export default Nomination;
