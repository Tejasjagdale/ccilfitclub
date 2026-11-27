# OFF•PACE — Company Events Portal

## Run locally

```bash
npm install
npm run dev
```

## Demo users

- Admin: `ADM007`
- Athlete: `EMP001`
- Other seeded athletes: `EMP002`–`EMP005`

## Access rules

- All routes except `/signin` require a signed-in roster user.
- Athletes land on one event dashboard with open registration, live events, previous results, and verified all-time records. Event links open the selected edition’s standings and records.
- The header avatar opens account details, the personal trophy cabinet, and sign-out.
- The active administrator lands directly in the Admin control room (`/admin`). Athlete routes redirect administrators back to that workspace.
- The administrator can create HYROX, Marathon, Chess and Carrom events. Registration opens on creation and closes at the end of the selected date in IST. The administrator can start the event after the deadline, score it while it is live, and end it to finalize results.
- HYROX and Marathon rank registered athletes by finish time. Chess and Carrom track the winner and score by round. Previously recorded disciplines remain in the archive.
- **Admin → Records → Add record** publishes an all-time record. Link a completed edition or use manual entry for a historical performance. Publishing the same sport and record name shows the existing value before replacement.
- Retired employees can sign in to view historical information, but cannot register for competitions or use admin controls.
- The single administrator can add employees by first name, last name and employee ID, and remove them from the directory. Removal revokes sign-in access and preserves live and completed event history.

## Firebase

Follow [Firebase setup](docs/firebase-setup.md) for Spark, Employee ID sign-in, admin browser enrolment, sample import, and the compact Firestore document layout. Without Firebase configuration the local demo continues to use browser storage.
