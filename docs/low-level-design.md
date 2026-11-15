# OFF•PACE — Low-level design

## 1. Product boundaries

The product has three core domains:

1. **Identity** — employee users, role and employment status.
2. **Competition operations** — fixed sport categories, scheduled competition instances, registration and lifecycle.
3. **Performance history** — stage/match results, final standings and verified records.

A fixed event category (e.g. HYROX) is not itself an event instance. An admin creates one or more dated competitions under the category (e.g. HYROX Q1 2026). Quarter views query competition instances by `event_category + year + quarter`.

## 2. Entities and relationships

```text
users 1 ─── * registrations * ─── 1 competitions * ─── 1 event_categories
users 1 ─── * competition_results * ─── 1 competitions
competitions 1 ─── * competition_stages 1 ─── * matches
matches 1 ─── * match_participants * ─── 1 users
users 1 ─── * event_records * ─── 1 event_categories
competitions 1 ─── * event_records
users 1 ─── * audit_log
```

### Users

- `id`: internal UUID primary key.
- `first_name`, `last_name`: display name.
- `employee_id`: unique, normalized company identifier; login lookup key.
- `status`: `ACTIVE | RETIRED`.
- `role`: `ATHLETE | ADMIN`.
- `department`, `team`: optional profile metadata.
- Retired users remain queryable in historical results and records. They cannot register for new competitions.

### Event categories

Seed and maintain the six categories: `HYROX`, `CHESS`, `CARROM`, `MARATHON`, `TABLE_TENNIS`, `ZENGA`. Category records contain a scoring format and display metadata; admins do not create arbitrary new category IDs through the normal competition form.

### Competitions

A competition belongs to exactly one event category and one quarter/year. It stores the registration window, event schedule, venue, capacity and lifecycle status. Suggested lifecycle:

`DRAFT → REGISTRATION_OPEN → UPCOMING → LIVE → COMPLETED`

`CANCELLED` can be reached from any non-final state. The backend must validate transitions and prevent reopening a completed event without an audited correction workflow.

### Registrations

A user can have at most one active registration per competition. The server validates that the user is active and has the `ATHLETE` role, the competition is accepting registrations, the deadline has not passed and capacity remains. A registration is never deleted; withdrawal/disqualification changes its status.

### Results and knockout matches

Do not force every sport into one score type:

- **HYROX**: finish time, optional station splits/penalties, overall rank.
- **Marathon**: finish time, distance/category, optional split times, overall rank.
- **Chess**: match pairing, round, result (`WIN/DRAW/LOSS`), points and bracket progression.
- **Carrom**: match pairing, board/round score, winner and bracket progression.
- **Table Tennis**: match pairing, games/sets won, points and bracket progression.
- **Zenga**: event-specific score/penalty data and rank; if operated as knockout, model each head-to-head round as a match.

Use `competition_stages`, `matches` and `match_participants` for knockout progression. Use `competition_results` for athlete-level stage/final standings. A winner of one early match is not the competition champion. Only the final stage determines final placing unless the sport's rules specify otherwise.

### Records

A record is a separately verified achievement. It references the category, athlete and source competition. Use `ALL_TIME` for the current category record and `UNIQUE` for milestones that should coexist. Record values can be numeric or formatted text (e.g. `01:08:42`); `metric_key` and `value_unit` provide comparison semantics. All-time records should only be replaced after a verified improvement under the category's comparison rule.

## 3. Main screens

- **Home**: live and upcoming competitions, active athlete count, registrations and result activity.
- **Events**: six fixed categories with live/competition counts.
- **Event detail**: quarter/year archive, each competition, registration status, current/final standings and category-wide records.
- **Athlete profile**: profile header, event participation and existing trophy cabinet.
- **Sign in/register**: employee identity entry; role is assigned/changed by an administrator, not by the athlete form.
- **Admin control room**: create competitions, set registration deadline/capacity, open/close registration, start/end event, enter round or timed results, verify records, create users and change role/status.

## 4. API boundary for backend implementation

Suggested endpoints:

- `POST /auth/employee-id` or company SSO callback.
- `GET /me`, `GET /users`, `POST /users`, `PATCH /users/:id`.
- `GET /event-categories`, `GET /event-categories/:id/competitions`.
- `POST /competitions`, `GET /competitions/:id`, `PATCH /competitions/:id/status`.
- `POST /competitions/:id/registrations`, `DELETE/PATCH /registrations/:id` (withdrawal status only).
- `POST /competitions/:id/stages`, `POST /matches`, `PATCH /matches/:id/result`.
- `POST /competitions/:id/results`, `GET /competitions/:id/standings`.
- `POST /records`, `GET /event-categories/:id/records`.

Every admin mutation must be authorized server-side and written to an audit log. Do not trust a role supplied by the browser.

## 5. Live updates

For production, publish competition status and score changes through WebSocket or Server-Sent Events. The public event detail subscribes only while its competition is `LIVE`, then refreshes the final standings after `COMPLETED`. Use a monotonically increasing result revision so clients can ignore stale messages.

## 6. Current prototype limitation

This frontend demo persists to `localStorage`. Data is local to one browser and does not synchronize between employees. Employee-ID-only sign-in is a demo shortcut, not secure authentication. Knockout score entry currently writes a winner/loser pair per stage; a full bracket engine, match scheduling, server-side validation, audit history and realtime transport belong in the backend phase.
