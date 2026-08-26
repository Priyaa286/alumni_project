const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// GET all alumni members
router.get('/members', async (req, res) => {
  try {
    // Get the MongoDB database connection
    const db = mongoose.connection.db;

    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'MongoDB database is not connected'
      });
    }

    const members = await db
      .collection('members')
      .find({})
      .toArray();

    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });

  } catch (error) {
    console.error('Error fetching members:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch members',
      error: error.message
    });
  }
});

module.exports = router;