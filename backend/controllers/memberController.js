const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let membersEmailMap = null;

// Helper to locate and load test.members.json immediately
const loadMembersJson = () => {
  if (membersEmailMap !== null) return membersEmailMap;

  membersEmailMap = new Map();
  try {
    const possiblePaths = [
      path.resolve(process.cwd(), 'test.members.json'),
      path.resolve(process.cwd(), '../test.members.json'),
      path.resolve(__dirname, '../../test.members.json'),
      path.resolve(__dirname, '../test.members.json'),
      'c:/Projects/III Yr/Alumni Form/alumni_project/test.members.json'
    ];

    const filePath = possiblePaths.find(p => fs.existsSync(p));

    if (!filePath) {
      console.warn('[Member Index] WARNING: test.members.json file not found in any of:', possiblePaths);
      return membersEmailMap;
    }

    console.log(`[Member Index] Loading test.members.json from: ${filePath}...`);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const membersList = JSON.parse(rawData);

    if (Array.isArray(membersList)) {
      membersList.forEach(member => {
        const emails = [
          member.basic?.email_id,
          member.basic?.alternate_email_id,
          member.contact_details?.email,
          member.contact_details?.email_id
        ].filter(Boolean);

        emails.forEach(e => {
          const cleanEmail = String(e).trim().toLowerCase();
          if (cleanEmail && cleanEmail !== 'null' && cleanEmail !== 'undefined') {
            membersEmailMap.set(cleanEmail, member);
          }
        });
      });
      console.log(`[Member Index] ✅ Indexed ${membersEmailMap.size} unique emails across ${membersList.length} alumni records.`);
    }
  } catch (err) {
    console.error('[Member Index] ERROR loading test.members.json:', err.message);
  }

  return membersEmailMap;
};

// Collect every distinct email known to the locally indexed alumni export and,
// when connected, the members collection. The export is retained as a fallback
// for development environments where MongoDB is unavailable.
exports.getAllMemberEmails = async () => {
  const emails = new Set(loadMembersJson().keys());

  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    try {
      const cursor = mongoose.connection.db.collection('members').find({}, {
        projection: {
          'basic.email_id': 1,
          'basic.alternate_email_id': 1,
          'contact_details.email': 1,
          'contact_details.email_id': 1,
        },
      });
      for await (const member of cursor) {
        [
          member.basic?.email_id,
          member.basic?.alternate_email_id,
          member.contact_details?.email,
          member.contact_details?.email_id,
        ].filter(Boolean).forEach((email) => {
          const cleanEmail = String(email).trim().toLowerCase();
          if (cleanEmail && cleanEmail !== 'null' && cleanEmail !== 'undefined') emails.add(cleanEmail);
        });
      }
    } catch (error) {
      console.warn('[Member Invitations] MongoDB email collection warning:', error.message);
    }
  }

  return Array.from(emails);
};

// Pre-load on startup
loadMembersJson();

// Helper to extract batch end_year safely
const extractBatchYear = (member) => {
  let endYear = null;

  if (member.membership_details && Array.isArray(member.membership_details)) {
    for (const m of member.membership_details) {
      if (m.details && Array.isArray(m.details)) {
        for (const d of m.details) {
          if (d.end_year) {
            endYear = parseInt(d.end_year, 10);
            if (!isNaN(endYear)) return endYear;
          }
        }
      }
    }
  }

  if (member.education_details && Array.isArray(member.education_details)) {
    for (const ed of member.education_details) {
      if (ed.end_year) {
        endYear = parseInt(ed.end_year, 10);
        if (!isNaN(endYear)) return endYear;
      }
    }
  }

  // Label fallback (e.g. "BE 2012, CSE" -> 2012)
  if (member.basic?.label) {
    const match = String(member.basic.label).match(/\b(19\d{2}|20\d{2})\b/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return null;
};

// Format member object into clean frontend nomination structure
const formatMemberData = (member) => {
  const basic = member.basic || {};
  const contact = member.contact_details || {};
  const currentLoc = contact.current_location || {};
  const addrList = Array.isArray(contact.address) ? contact.address : [];
  const primaryAddr = addrList[0] || {};
  const memDetails = member.membership_details?.[0]?.details?.[0] || member.education_details?.[0] || {};
  const workDetails = member.work_details?.[0] || {};
  const profDetails = member.professional_details || {};

  const batchYear = extractBatchYear(member);

  // Clean up mobile phone number (remove +91 prefix and non-digits)
  let cleanMobile = contact.mobile || '';
  cleanMobile = cleanMobile.replace(/^\+91[\s-]?/, '').replace(/\D/g, '');
  if (cleanMobile.length > 10) {
    cleanMobile = cleanMobile.slice(-10);
  }

  // Extract State safely
  let state = primaryAddr.state || '';
  if (!state && currentLoc.location) {
    const parts = currentLoc.location.split(',').map(s => s.trim());
    if (parts.length >= 3) {
      state = parts[2];
    } else if (parts.length >= 2 && parts[1] !== 'India') {
      state = parts[1];
    }
  }
  if (!state && (currentLoc.country === 'India' || primaryAddr.country === 'India')) {
    state = 'Tamil Nadu';
  }

  // Extract Address safely
  let address = primaryAddr.address || '';
  if (!address && currentLoc.location) {
    address = currentLoc.location;
  } else if (!address && primaryAddr.city) {
    address = `${primaryAddr.city}, ${state || 'Tamil Nadu'}`;
  }

  // Extract and normalize Department to match form dropdown values
  let rawStream = memDetails.stream || memDetails.course || basic.label || '';
  let department = rawStream;

  const s = rawStream.toLowerCase();
  if (s.includes('computer') || s.includes('cse')) {
    department = 'Computer Science and Engineering';
  } else if (s.includes('electrical') || s.includes('eee')) {
    department = 'Electrical and Electronics Engineering';
  } else if (s.includes('communication') || s.includes('ece')) {
    department = 'Electronics and Communication Engineering';
  } else if (s.includes('information') || s.includes('it')) {
    department = 'Information Technology';
  } else if (s.includes('mechanical') || s.includes('mech')) {
    department = 'Mechanical Engineering';
  } else if (s.includes('civil')) {
    department = 'Civil Engineering';
  } else if (s.includes('instrumentation') || s.includes('eie')) {
    department = 'Electronics and Instrumentation Engineering';
  } else if (s.includes('artificial') || s.includes('aids')) {
    department = 'Artificial Intelligence and Data Science';
  }

  // Extract Experience
  let experience = '';
  if (profDetails.experience_years) {
    experience = `${profDetails.experience_years} Years`;
  }

  return {
    name: basic.name || '',
    email: basic.email_id || basic.alternate_email_id || '',
    batch: batchYear ? String(batchYear) : '',
    department: department,
    mobile: cleanMobile || '',
    city: currentLoc.city || primaryAddr.city || '',
    address: address,
    state: state,
    country: currentLoc.country || primaryAddr.country || 'India',
    linkedin: basic.profile_links?.linkedin || '',
    isRegisteredAlumni: 'Yes',
    professional: {
      designation: workDetails.position || '',
      organization: workDetails.name || '',
      experience: experience
    }
  };
};

// Controller: Lookup member by email
exports.lookupMemberByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    const queryEmail = String(email).trim().toLowerCase();
    let foundMember = null;

    // 1. Search in-memory JSON index first (super-fast 12,049 member index)
    const map = loadMembersJson();
    foundMember = map.get(queryEmail);

    // 2. Fallback to MongoDB if connected and not found in JSON index
    if (!foundMember && mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        const db = mongoose.connection.db;
        foundMember = await db.collection('members').findOne({
          $or: [
            { 'basic.email_id': new RegExp(`^${queryEmail}$`, 'i') },
            { 'basic.alternate_email_id': new RegExp(`^${queryEmail}$`, 'i') }
          ]
        });
      } catch (dbErr) {
        console.warn('[Member Lookup] DB search notice:', dbErr.message);
      }
    }

    if (!foundMember) {
      return res.status(404).json({
        success: false,
        message: `No matching record found for "${email}". Please fill in details manually.`
      });
    }

    // Check batch cutoff year (upto 2026)
    const batchYear = extractBatchYear(foundMember);

    if (batchYear && batchYear > 2026) {
      return res.status(400).json({
        success: false,
        message: `Alumni record found for ${foundMember.basic?.name || 'Member'}, but graduation batch (${batchYear}) exceeds the 2026 cutoff limit.`
      });
    }

    const formattedData = formatMemberData(foundMember);

    return res.status(200).json({
      success: true,
      message: `Alumni record found for ${formattedData.name}! Details auto-filled.`,
      data: formattedData
    });
  } catch (error) {
    console.error('Error looking up member by email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to look up member details',
      error: error.message
    });
  }
};
