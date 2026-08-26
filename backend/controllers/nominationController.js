const Nomination = require('../models/Nomination');
const Counter = require('../models/Counter');
const mongoose = require('mongoose');

// In-Memory Storage Fallback (used when local MongoDB server is not running)
const inMemoryNominations = new Map();
let inMemorySeq = 0;

// Create a new Nomination
exports.createNomination = async (req, res) => {
  try {
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
    let nominations = [];

    if (mongoose.connection.readyState === 1) {
      nominations = await Nomination.find().sort({ createdAt: -1 });
    } else {
      // In-Memory Mode
      nominations = Array.from(inMemoryNominations.values())
        .filter((val, index, self) => self.findIndex(t => t._id === val._id) === index);
    }

    // Default Mock Nominations if database is empty
    if (!nominations || nominations.length === 0) {
      nominations = [
        {
          _id: 'mock_101',
          nominationId: 'NOM-2026-0001',
          category: 'Scientific',
          status: 'Submitted',
          createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          nominee: {
            fullName: 'Dr. A. R. Sundaram',
            degree: 'B.E. Computer Science',
            graduationYear: '2008',
            designation: 'Principal AI Researcher',
            organization: 'DeepMind Robotics',
            email: 'sundaram.ar@example.com',
            mobile: '+91 98765 43210'
          },
          nominator: {
            fullName: 'Prof. K. Subramanian',
            relationToNominee: 'Former Professor & HOD',
            email: 'subramanian.k@nec.edu',
            mobile: '+91 94431 12345'
          },
          accomplishments: 'Pioneered breakthroughs in neural network optimization for medical imaging algorithms, published over 40 high-impact papers, and holds 6 international patents.',
          contributionsToNEC: 'Guest speaker for annual alumni tech symposium and established research scholarship fund for underprivileged engineering students.'
        },
        {
          _id: 'mock_102',
          nominationId: 'NOM-2026-0002',
          category: 'Business',
          status: 'Under Review',
          createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          nominee: {
            fullName: 'Priya Venkatesh',
            degree: 'B.Tech Information Technology',
            graduationYear: '2012',
            designation: 'Founder & CEO',
            organization: 'EcoGrid Tech Solutions',
            email: 'priya.v@ecogridtech.com',
            mobile: '+91 98123 76543'
          },
          nominator: {
            fullName: 'Rajesh Kumar',
            relationToNominee: 'Batchmate & Co-founder',
            email: 'rajesh.k@ecogridtech.com',
            mobile: '+91 98989 12345'
          },
          accomplishments: 'Built a clean-tech startup valued at $50M that provides smart solar microgrids across rural South India, empowering 500+ villages.',
          contributionsToNEC: 'Provides campus recruitment opportunities and sponsors NEC Innovation Incubator lab.'
        },
        {
          _id: 'mock_103',
          nominationId: 'NOM-2026-0003',
          category: 'Social',
          status: 'Approved',
          createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
          nominee: {
            fullName: 'Captain M. Ramesh',
            degree: 'B.E. Mechanical Engineering',
            graduationYear: '2001',
            designation: 'Director of Operations',
            organization: 'Asha Rural Foundation',
            email: 'm.ramesh@ashafoundation.org',
            mobile: '+91 97711 22334'
          },
          nominator: {
            fullName: 'Dr. V. Meenakshi',
            relationToNominee: 'Alumni Association Member',
            email: 'meenakshi.v@nec.edu',
            mobile: '+91 94422 99887'
          },
          accomplishments: 'Leads disaster relief operations and clean drinking water initiatives across flood-prone regions, benefitting over 100,000 households.',
          contributionsToNEC: 'Key organizer for NEC Alumni Benevolent Fund and mentor for student NSS chapter.'
        }
      ];
    }

    res.status(200).json({
      success: true,
      count: nominations.length,
      data: nominations
    });
  } catch (error) {
    console.error('Error fetching all nominations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve nominations'
    });
  }
};

