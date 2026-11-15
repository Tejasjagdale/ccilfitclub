# OFF•PACE — Company Events Portal

## Run locally

```bash
npm install
npm run dev
```

## Demo users

- Admin: `ADM001`
- Athlete: `EMP001`
- Other seeded athletes: `EMP002`–`EMP005`

## Access rules

- All routes except `/signin` require a signed-in roster user.
- Athletes see Home and Athletes navigation. They can open a competition from Home to view its standings and register when registration is open.
- The Events category index (`/events`) and Admin control room (`/admin`) are restricted to active administrators. Athletes can open individual event details from Home to see standings and register where eligible.
- Admins can create competitions, change the registration deadline before the competition begins, open registration, mark an event upcoming, start it, publish live scores for registered participants, complete an event and verify records.
- Retired employees can sign in to view historical information, but cannot register for competitions or use admin controls.
- New accounts are created by an administrator in the user directory. Public self-registration is disabled.

## Authentication limitation — read before production

This is a frontend prototype. Sign-in currently matches an employee ID against the browser's local roster and stores the selected user in `localStorage`. An employee ID alone does not prove identity, and browser-side role checks are not a security boundary. The app must be connected to company SSO or a server-side identity provider before real employee data or internal competitions are deployed. Admin authorization, score writes and records must be enforced again by the backend.

Competition data is currently persisted in `localStorage`, so changes are visible only in the same browser profile. A shared backend/database and server-sent events or WebSockets are needed for cross-device updates and genuinely live standings.
