const COMMITTEE_EMAILS = new Set(
  String(process.env.NOTABLE_ALUMNI_COMMITTEE_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

const isServingCommitteeMember = (email) =>
  Boolean(email && COMMITTEE_EMAILS.has(String(email).trim().toLowerCase()));

module.exports = { isServingCommitteeMember };
