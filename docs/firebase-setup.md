# Firebase setup for OFF·PACE

## Connect a Spark project

1. Create a Firebase project on Spark and register a web app. Copy the web SDK values into a local `.env.local` based on [the example](../.env.example). They are public browser configuration. No service-account file is required. [Firebase web setup](https://firebase.google.com/docs/web/setup)
2. Create the default **Standard** Cloud Firestore database in production mode. Enable **Anonymous** in Firebase Authentication so everyone can use the same one-field sign-in form. [Get started with Firestore](https://firebase.google.com/docs/firestore/quickstart)
3. With the Firebase CLI signed into the project owner account, deploy the rules and index exemptions alongside the updated frontend.

   ```sh
   firebase deploy --only firestore:rules,firestore:indexes --project YOUR_PROJECT_ID
   ```

4. In Firestore, set the string field `p` on `employeeKeys/id-ADM007` to `u-admin`. Then set the string field `key` on `settings/admin` to `id-ADM007`. These settings also migrate projects that previously used a private ID or browser UID. Changing the active key revokes sessions using the previous one.
5. Enter `ADM007` in the Employee ID field to open the admin panel. Anyone who knows this ID can administer the club. Athletes continue using their own employee IDs. On an empty dashboard, **Import sample data** loads the original demo records.

Local demo mode runs when the Firebase environment fields are empty. Changes made in the earlier browser-only demo stay there. If you want to host the app on Firebase Hosting, run `npm run build` with the Firebase environment configured, then deploy `hosting` to the same project. The routing rewrite is included in `firebase.json`.

## Local emulator

Run `firebase emulators:start --only auth,firestore --project demo-offpace` with a supported Java runtime. Start Vite in a second terminal with `VITE_USE_FIREBASE_EMULATORS=true`. Create the two documents from step 4 in the emulator. Emulator data is separate from the cloud project. [Firebase Auth emulator guide](https://firebase.google.com/docs/emulator-suite/connect_auth)

## Compact documents

See the [sample JSON](firebase-data.example.json) for the wire shape. The codec expands it to the typed application state.

| Document | Stored data |
| --- | --- |
| `settings/admin` | Active sign-in key for the administrator |
| `core/directory` | Names and compact status codes, with trophy awards under each internal person ID |
| `core/employeeIds` | Private map of internal person IDs to employee IDs for the admin directory |
| `employeeKeys/{key}` | One exact-ID lookup for each employee who can sign in. Keys use `id-` plus the URL-encoded uppercase employee ID |
| `access/{uid}` | The person ID and lookup key used by a signed-in browser |
| `core/events` | Edition metadata, with registration bounds as epoch milliseconds so rules can check deadlines |
| `core/records` | All-time records and unique achievements keyed by record ID |
| `activity/{editionId}` | Active registrations keyed by person ID, plus optional withdrawn registrations, standings, and matches |

Sport definitions and artwork ship with the web app. Documents omit unused award fields, notes, and empty event metadata. Registration, scoring, and edition changes use transactions and update only the affected documents. Admin actions, protected employee-ID reads, and single-athlete registration writes are enforced by Firestore rules.

## Spark usage

Standard Firestore includes **1 GiB stored**, **50,000 reads/day**, **20,000 writes/day**, **20,000 deletes/day**, and **10 GiB outbound/month** for the free database. These are usage limits rather than a six-month allowance. [Firestore quotas](https://firebase.google.com/docs/firestore/quotas)

A rough starting estimate with **40 editions** and **200 new sessions per day** is about **9,200 document reads** for initial snapshots, before security-rule reads and reconnects. If **100 clients** are signed in for **30 score updates**, that adds about **3,000 listener document reads** for those updates before rules and write-transaction reads. Traffic and fan-out matter more than JSON size at this scale. Monitor **Firestore → Usage** in the first week and after large events. [How listener reads are billed](https://firebase.google.com/docs/firestore/pricing#listening_to_query_results)
