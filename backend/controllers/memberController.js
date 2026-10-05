const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { parseCsv } = require('../utils/parseCsv');

let membersEmailMap = null;
const activityCsvCache = new Map();

const readActivityCsv = (filename) => {
  const filePath = path.resolve(filename);
  try {
    const stat = fs.statSync(filePath);
    const cached = activityCsvCache.get(filePath);
    if (cached?.modifiedAt === stat.mtimeMs) return cached.rows;
    const rows = parseCsv(fs.readFileSync(filePath, 'utf8'));
    activityCsvCache.set(filePath, { modifiedAt: stat.mtimeMs, rows });
    return rows;
  } catch {
    return [];
  }
};

const activityCsvPath = (envName, defaultName) => {
  const configuredPath = process.env[envName];
  if (!configuredPath) return path.resolve(__dirname, '../data/private', defaultName);
  return path.isAbsolute(configuredPath) ? configuredPath : path.resolve(__dirname, '..', configuredPath);
};

const findMemberByEmail = async (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) return null;
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    try {
      const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const emailMatch = new RegExp(`^${escapedEmail}$`, 'i');
      const found = await mongoose.connection.db.collection('members').findOne({
        $or: [
          { 'basic.email_id': emailMatch },
          { 'basic.alternate_email_id': emailMatch },
          { 'contact_details.email': emailMatch },
          { 'contact_details.email_id': emailMatch },
        ],
      });
      if (found) return found;
    } catch (dbErr) {
      console.warn('[Member Lookup] DB search notice:', dbErr.message);
    }
  }
  return loadMembersJson().get(normalizedEmail) || null;
};

exports.isKnownAlumniEmail = async (email) => Boolean(await findMemberByEmail(email));

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
  const workHistory = (Array.isArray(member.work_details) ? member.work_details : []).map((work) => ({
    organization: work?.name || '',
    designation: work?.position || '',
    department: work?.department || '',
    startYear: work?.start_year || '',
    endYear: work?.current_company ? 'Present' : (work?.end_year || ''),
    isCurrent: Boolean(work?.current_company),
  }));

  const toActivityList = (...sources) => sources
    .filter(Array.isArray)
    .flat()
    .map((entry) => !entry ? null : typeof entry === 'string' ? { description: entry } : {
      title: entry.title || entry.name || entry.topic || '',
      description: entry.description || entry.details || '',
      date: entry.date || entry.event_date || '',
      organization: entry.organization || entry.institution || '',
      participants: entry.participants || entry.attendees || '',
    })
    .filter((entry) => entry && Object.values(entry).some(Boolean));

  const mentoring = toActivityList(member.mentorship_details, member.mentorships, member.activities?.mentoring);
  const webinars = toActivityList(member.webinar_details, member.webinars, member.activities?.webinars);

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
    experience = String(profDetails.experience_years);
  }

  const workSummary = workHistory
    .map((work) => `${[work.designation, work.organization].filter(Boolean).join(' at ')}${work.startYear ? ` (${work.startYear}–${work.endYear || 'Present'})` : ''}`)
    .filter(Boolean)
    .join('; ');
  const profileSummary = [workSummary, Array.isArray(profDetails.skills) && profDetails.skills.length ? `Skills: ${profDetails.skills.join(', ')}` : '']
    .filter(Boolean)
    .join('. ');

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
      experience: experience,
      experienceYears: profDetails.experience_years || '',
      skills: Array.isArray(profDetails.skills) ? profDetails.skills : [],
      industries: Array.isArray(profDetails.industries) ? profDetails.industries : [],
      workHistory,
      profileSummary,
    },
    contributions: { mentoring, webinars },
  };
};

const loadMemberActivities = async (email) => {
  const normalizedEmail = String(email).trim().toLowerCase();
  const emailRecords = (record) => {
    const emails = [record.email, record.alumniEmail, record.alumni_email, record.memberEmail, record.member_email,
      record.alumni?.email, record.member?.email];
    return emails.some((value) => String(value || '').trim().toLowerCase() === normalizedEmail);
  };
  const normalize = (record) => ({
    title: String(record.title || record.name || record.topic || record.event_name || ''),
    description: String(record.description || record.details || record.summary || ''),
    date: String(record.date || record.event_date || record.webinar_date || ''),
    organization: String(record.organization || record.institution || record.department || ''),
    participants: String(record.participants || record.attendees || record.attendee_count || ''),
    venue: String(record.venue || record.webinarVenue || ''),
    speakerName: String(record.speakerName || ''),
    designation: String(record.designation || ''),
  });
  const readMongoActivities = async (names, match) => {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) return [];
    for (const name of names) {
      try {
        const records = await mongoose.connection.db.collection(name).find(match).limit(100).toArray();
        if (records.length) return records;
      } catch (error) {
        console.warn(`[Member Activities] Could not read ${name}:`, error.message);
      }
    }
    return [];
  };

  const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const emailMatch = new RegExp(`^${escapedEmail}$`, 'i');
  const emailMatchQuery = { $or: [
    { email: emailMatch }, { alumniEmail: emailMatch }, { alumni_email: emailMatch },
    { memberEmail: emailMatch }, { member_email: emailMatch },
    { 'alumni.email': emailMatch }, { 'member.email': emailMatch },
  ] };
  const [mongoMentoring, mongoWebinars] = await Promise.all([
    readMongoActivities(['mentorships', 'mentoring', 'mentorship_records'], emailMatchQuery),
    readMongoActivities(['webinars', 'webinar_records', 'guest_lectures'], emailMatchQuery),
  ]);

  const webinarCsvRecords = readActivityCsv(activityCsvPath('WEBINAR_SPEAKERS_CSV', 'webinar.speakers.csv'))
    .filter((record) => String(record.email || '').trim().toLowerCase() === normalizedEmail)
    .map((record) => normalize({
      title: record.topic || record.domain,
      description: [
        record.domain && `Domain: ${record.domain}`,
        record.name && `Speaker: ${record.name}`,
        record.speakerPhoto && `Speaker photo: ${record.speakerPhoto}`,
        record.department && `Department: ${record.department}`,
        record.batch && `Batch: ${record.batch}`,
        record.alumniCity && `Alumni city: ${record.alumniCity}`,
        record.meetingLink && `Meeting link: ${record.meetingLink}`,
        record.phaseId && `Phase: ${record.phaseId}`,
        record['slots[0].time'] && `Time: ${record['slots[0].time']}`,
        record['slots[0].deadline'] && `Deadline: ${record['slots[0].deadline']}`,
      ].filter(Boolean).join(' — '),
      date: record['slots[0].webinarDate'],
      organization: record.companyName || 'National Engineering College',
      venue: record.webinarVenue,
      speakerName: record.name,
      designation: record.designation,
    }));

  // Mentor registrations contain only mentor_id; resolve that key through the mentor profile collection.
  const assignedRegistrations = readActivityCsv(activityCsvPath('MENTOR_REGISTRATIONS_CSV', 'mentorship.mentorregistrations.csv'))
    .filter((record) => String(record.status || '').trim().toLowerCase() === 'assigned');
  let csvMentoringRecords = [];
  if (assignedRegistrations.length && mongoose.connection.readyState === 1 && mongoose.connection.db) {
    const mentorIds = [...new Set(assignedRegistrations.map((record) => String(record.mentor_id || '').trim()).filter(Boolean))];
    const objectIds = mentorIds.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
    const collectionNames = process.env.MENTOR_PROFILE_COLLECTION
      ? [process.env.MENTOR_PROFILE_COLLECTION]
      : ['mentors', 'mentor_profiles', 'alumni_mentors', 'mentorusers', 'users', 'members'];
    for (const collectionName of collectionNames) {
      try {
        const profiles = await mongoose.connection.db.collection(collectionName).find({
          $or: [
            ...(objectIds.length ? [{ _id: { $in: objectIds } }] : []),
            { _id: { $in: mentorIds } },
          ],
        }).toArray();
        if (!profiles.length) continue;
        const profileEmails = new Map();
        profiles.forEach((profile) => {
          const id = String(profile._id);
          const profileEmail = profile.email || profile.email_id || profile.emailId || profile.basic?.email_id ||
            profile.contact_details?.email || profile.contact_details?.email_id;
          if (profileEmail) profileEmails.set(id, String(profileEmail).trim().toLowerCase());
        });
        csvMentoringRecords = assignedRegistrations
          .filter((record) => profileEmails.get(String(record.mentor_id || '').trim()) === normalizedEmail)
          .map((record) => {
            const areas = Object.entries(record).filter(([key, value]) => /^areas_of_interest\[\d+\]$/.test(key) && value.trim()).map(([, value]) => value.trim());
            return normalize({
              title: 'NEC Alumni Mentorship',
              description: [record.description, areas.length && `Areas: ${areas.join(', ')}`, record.status && `Status: ${record.status}`, record.phaseId && `Phase: ${record.phaseId}`].filter(Boolean).join('. '),
              date: record.assignedDate || record.createdAt,
              organization: 'National Engineering College',
            });
          });
        if (profileEmails.size) break;
      } catch (error) {
        console.warn(`[Member Activities] Could not resolve mentor profiles in ${collectionName}:`, error.message);
      }
    }
  }

  const uniqueRecords = (records) => [...new Map(records.map((record) => [
    [record.title, record.description, record.date, record.organization].join('|'), record,
  ])).values()];
  const csvMentoring = csvMentoringRecords;
  const emailMentoring = readActivityCsv(activityCsvPath('MENTOR_REGISTRATIONS_CSV', 'mentorship.mentorregistrations.csv'))
    .filter(emailRecords).map(normalize);
  return {
    mentoring: uniqueRecords([...mongoMentoring, ...emailMentoring, ...csvMentoring].map(normalize)),
    webinars: uniqueRecords([...mongoWebinars, ...webinarCsvRecords].map(normalize)),
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
    // Prefer MongoDB so current professional and contact details take precedence.
    const foundMember = await findMemberByEmail(queryEmail);

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
    const matchingSpeakerRecords = readActivityCsv(activityCsvPath('WEBINAR_SPEAKERS_CSV', 'webinar.speakers.csv'))
      .filter((record) => String(record.email || '').trim().toLowerCase() === queryEmail)
      .sort((left, right) => new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0));
    const speakerRecord = matchingSpeakerRecords[0];
    if (speakerRecord) {
      formattedData.name ||= speakerRecord.name || '';
      formattedData.department ||= speakerRecord.department || '';
      const speakerPhone = String(speakerRecord.phoneNumber || '').replace(/\D/g, '').slice(-10);
      if (!formattedData.mobile && /^[6-9]\d{9}$/.test(speakerPhone)) formattedData.mobile = speakerPhone;
      formattedData.professional.designation ||= speakerRecord.designation || '';
      formattedData.professional.organization ||= speakerRecord.companyName || '';
    }
    const databaseActivities = await loadMemberActivities(queryEmail);
    if (databaseActivities.mentoring.length) {
      formattedData.contributions.mentoring = [...formattedData.contributions.mentoring, ...databaseActivities.mentoring];
    }
    if (databaseActivities.webinars.length) {
      formattedData.contributions.webinars = [...formattedData.contributions.webinars, ...databaseActivities.webinars];
    }

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
