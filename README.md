# Office Events Frontend

A simple, dark-only frontend skeleton built with React, Vite, TypeScript and Material UI.

## Run
```bash
npm install
npm run dev
```

## Pages
- `/` — simple home page / overview
- `/events` — dedicated events list with category filter
- `/athletes` — athlete directory with search and status filters
- `/athletes/:employeeId` — individual athlete profile
- `/signin` — employee ID sign-in placeholder
- `/register` — first name, last name and employee ID registration placeholder

## Shared dummy data
- `src/data/people.json` — five employee/athlete records. Used by the directory, profile pages and home page.
- `src/data/events.json` — three sample events.

Employee statuses are `ACTIVE` and `RETIRED`. Registration does not ask users to set their status; that should be managed by an admin/backend later.

No backend or real form submission is connected yet.

## Theme
The application uses a dark-only slate and muted teal palette. There is no light-mode toggle.

## Athlete profile experience
The athlete profile keeps the athlete header, then separates `Trophy cabinet` and `Events participated` into tabs. The cabinet is an isolated Three.js component in `src/components/TrophyCabinet3D.tsx` with its own stylesheet. It renders a 3D collector's cabinet with wood-grain materials, inset velvet bays, carved brass detailing, drawer fronts, subdued warm spotlights, soft shadows and restrained bloom. Lighting is intentionally kept low so the wood grain, velvet backing and trophy silhouettes remain visible without blown-out highlights. The fixed HYROX cup, chess knight and race medal models are clickable; hovering lifts them into their light and selecting one animates it forward before the achievement dialog opens. Drag to inspect the cabinet from a slight angle and use the wheel/pinch to zoom. Award records are demo data in `AthleteProfilePage.tsx` and can later be replaced with API data. The cabinet uses Three.js `0.187.x` and `@types/three` `0.187.x`.
