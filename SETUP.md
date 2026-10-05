# Alumni portal setup

## Local configuration

1. Copy `backend/.env.example` to `backend/.env`. For localhost development, set `LOCAL_DEV_AUTH=true`; this enables a development-only sign-in from localhost without SMTP or Firebase. Use an email listed in `ADMIN_EMAILS` for admin access. Never set `LOCAL_DEV_AUTH=true` on a deployed server. For deployment, set `LOCAL_DEV_AUTH=false`, configure Firebase or SMTP for sign-in, and configure SMTP if nominee approval emails are needed. Also set `NOTABLE_ALUMNI_COMMITTEE_EMAILS` to the current committee, `AUTH_TOKEN_SECRET` to a long random value, and configure `MONGO_URI`.
2. Copy `client/.env.example` to `client/.env` and enter the Firebase web app settings. Enable Google as a sign-in provider in Firebase Authentication. Set `FIREBASE_PROJECT_ID` in the backend to the same Firebase project ID.
3. Run `npm install` in the repository root, then `npm install` in `backend` and `client`. Start the backend and client with the root scripts.

## Alumni and activity data

The member lookup reads alumni from the MongoDB `members` collection and, for local development, from `test.members.json` when present in the project root. Keep that file out of Git because it contains alumni personal information. Work history, designation, organization, experience, skills, and industries are filled from member records and remain editable in the form.

Mentorship and webinar activity is read from inline member fields, MongoDB activity collections, and the supplied CSV files. The private CSV files belong in `backend/data/private/`; they are excluded from Git because they contain personal records. `webinar.speakers.csv` matches alumni by speaker email. `mentorship.mentorregistrations.csv` contains `mentor_id` but no email, so assigned records are matched through a mentor profile collection whose IDs and email addresses correspond. Set `MENTOR_PROFILE_COLLECTION` if that collection is not named `mentors`. Copy these private files securely to each deployment; they are not included in a Git push.

## Award history and nomination schedule

The nomination form requires a matching NEC alumni record, a description of the achievement's benefit, category details, a drawn signature, two recent photographs, identity and eligibility proof, achievement evidence, appreciation letters or news coverage, and a short profile. Nominations by others also require the nominator source, nominee details, and a consent letter. Committee members cannot nominate or be nominated while listed as serving in `NOTABLE_ALUMNI_COMMITTEE_EMAILS`.

The admin review page records two named reviewers, five scores from 0–5 for each reviewer, and each reviewer's recommendation. An award winner must have approved document verification and two positive recommendations. Winners and revoked winners cannot be nominated again. A nominee marked **Not awarded** can reapply after two years (for example, a 2024 non-selection can reapply in 2026).

Set the opening and closing date/time in the admin dashboard. The server checks the saved window when each public nomination is submitted. The committee may keep non-selection reasons confidential and revoke a winner's award with a recorded reason if false information is found.

Set `APP_BASE_URL` to the deployed client URL so back-office nominee approval links point to the correct site.
