import Nomination from '../models/nomination.js';

// Send Email/SMS notification placeholders
const sendNotifications = (nomination) => {
  console.log('--------------------------------------------------');
  console.log(`[EMAIL NOTIFICATION PLACEHOLDER]`);
  console.log(`To: ${nomination.nomineeDetails.email}`);
  console.log(`Subject: NEC Notable Alumni Award Nomination Submitted - ${nomination.nominationId}`);
  console.log(`Body: Dear ${nomination.nomineeDetails.name}, your nomination for the Notable Alumni Award has been successfully received.`);
  console.log(`Nomination ID: ${nomination.nominationId}`);
  console.log('--------------------------------------------------');

  console.log(`[SMS NOTIFICATION PLACEHOLDER]`);
  console.log(`To: ${nomination.nomineeDetails.mobile}`);
  console.log(`Message: Your nomination for NEC Notable Alumni Award has been submitted. ID: ${nomination.nominationId}. Thank you!`);
  console.log('--------------------------------------------------');
};

// Create a new Nomination
export const createNomination = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const prefix = `NOM-${currentYear}-`;
    
    // Generate unique Nomination ID
    let count = await Nomination.countDocuments({
      nominationId: { $regex: `^${prefix}` }
    });
    
    let nominationId = `${prefix}${String(count + 1).padStart(4, '0')}`;
    let exists = await Nomination.exists({ nominationId });
    while (exists) {
      count++;
      nominationId = `${prefix}${String(count + 1).padStart(4, '0')}`;
      exists = await Nomination.exists({ nominationId });
    }

    const nominationData = {
      ...req.body,
      nominationId
    };

    const nomination = new Nomination(nominationData);
    await nomination.save();

    // Trigger placeholder notifications
    sendNotifications(nomination);

    res.status(201).json({
      success: true,
      message: 'Nomination submitted successfully',
      data: nomination
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit nomination'
    });
  }
};

// Get Nomination by ID (MongoDB object ID or generated Nomination ID)
export const getNominationById = async (req, res) => {
  try {
    const { id } = req.params;
    let nomination;
    
    // Check if ID is a valid MongoDB ObjectId format, otherwise search by nominationId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      nomination = await Nomination.findById(id);
    } else {
      nomination = await Nomination.findOne({ nominationId: id });
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
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving nomination'
    });
  }
};

// Update Nomination
export const updateNomination = async (req, res) => {
  try {
    const { id } = req.params;
    let nomination;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      nomination = await Nomination.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    } else {
      nomination = await Nomination.findOneAndUpdate({ nominationId: id }, req.body, { new: true, runValidators: true });
    }

    if (!nomination) {
      return res.status(404).json({
        success: false,
        message: 'Nomination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Nomination updated successfully',
      data: nomination
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update nomination'
    });
  }
};

// Delete Nomination
export const deleteNomination = async (req, res) => {
  try {
    const { id } = req.params;
    let nomination;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      nomination = await Nomination.findByIdAndDelete(id);
    } else {
      nomination = await Nomination.findOneAndDelete({ nominationId: id });
    }

    if (!nomination) {
      return res.status(404).json({
        success: false,
        message: 'Nomination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Nomination deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete nomination'
    });
  }
};

// Get Award Categories Metadata
export const getCategories = (req, res) => {
  const categories = [
    {
      id: 'Business',
      title: 'Business, Economic & Entrepreneurial Accomplishment',
      description: 'Recognizing alumni who have demonstrated exceptional leadership, innovation, and success in entrepreneurship and business.',
      icon: 'Briefcase'
    },
    {
      id: 'Academic',
      title: 'Academic Leadership & Accomplishment',
      description: 'Honoring alumni who have achieved milestones in research, education, teaching excellence, or academic administration.',
      icon: 'GraduationCap'
    },
    {
      id: 'Scientific',
      title: 'Scientific & Technological Development',
      description: 'Celebrating advancements in scientific research, engineering breakthrough solutions, patents, and technical innovation.',
      icon: 'FlaskConical'
    },
    {
      id: 'Sports',
      title: 'Cultural & Sports Achievement',
      description: 'Applauding alumni who have represented or excelled at the state, national, or international stage in sports or arts.',
      icon: 'Trophy'
    },
    {
      id: 'Social',
      title: 'Social, Humanitarian & Voluntary Leadership',
      description: 'Acknowledging community outreach, volunteer services, charity, and active contributions to community betterment.',
      icon: 'HeartHandshake'
    },
    {
      id: 'Political',
      title: 'Political, Legal & Governmental Affairs',
      description: 'Commending outstanding dedication and leadership in public administration, legal systems, and governance services.',
      icon: 'Scale'
    },
    {
      id: 'Retired Service',
      title: 'Retired Service Men & Women',
      description: 'Saluting retired veterans from Army, Navy, Air Force, CAPF, or Coast Guard for their valor, duty, and national service.',
      icon: 'ShieldAlert'
    }
  ];

  res.status(200).json({
    success: true,
    data: categories
  });
};

// File Upload Handler
export const uploadFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fieldName: req.body.fieldName || req.file.fieldname,
        fileName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed'
    });
  }
};
