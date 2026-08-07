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
