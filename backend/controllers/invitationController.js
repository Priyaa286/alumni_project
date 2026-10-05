const { getAllMemberEmails } = require('./memberController');
const { sendNominationInvitation } = require('../utils/sendEmail');

exports.sendNominationInvitations = async (req, res) => {
  const emails = await getAllMemberEmails();
  const formUrl = process.env.NOMINATION_FORM_URL;

  if (!formUrl) {
    return res.status(500).json({ success: false, message: 'NOMINATION_FORM_URL is not configured on the server.' });
  }
  if (!emails.length) {
    return res.status(404).json({ success: false, message: 'No alumni email addresses were found in the database.' });
  }

  // Process small batches to avoid overwhelming the SMTP provider.
  const results = [];
  for (let index = 0; index < emails.length; index += 10) {
    const batch = emails.slice(index, index + 10);
    const batchResults = await Promise.all(batch.map(async (email) => ({ email, ...(await sendNominationInvitation(email, formUrl)) })));
    results.push(...batchResults);
  }

  const sent = results.filter((item) => item.sent).length;
  return res.status(200).json({
    success: true,
    message: `Nomination form invitation sent to ${sent} of ${emails.length} alumni email addresses.`,
    total: emails.length,
    sent,
    failed: results.filter((item) => !item.sent).map((item) => item.email),
  });
};
