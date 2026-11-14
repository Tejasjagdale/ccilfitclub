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
The athlete profile keeps the athlete header, then separates `Trophy cabinet` and `Events participated` into tabs. The cabinet is an isolated, lightweight 2D SVG component in `src/components/TrophyCabinet.tsx` with its own stylesheet. It recreates the collector's cabinet as a static vector illustration: layered mahogany framing, inset velvet bays, carved brass corner details, thick shelves, drawer fronts and restrained warm spotlights. The fixed HYROX cup, chess knight and race medal artwork is drawn as vector shapes, so it stays crisp at every size without WebGL, a canvas renderer or a continuous animation loop. Hovering lifts an award into its light; selecting one animates it forward before the achievement dialog opens. Award records are demo data in `AthleteProfilePage.tsx` and can later be replaced with API data. Three.js is not required.


### Trophy presentation
The collector cabinet is rendered as a lightweight SVG illustration for mobile performance. Event-specific trophy artwork is shared between the shelf and award details dialog. Selecting an award lifts it from its shelf before the enlarged trophy artwork arrives in the details panel; closing the panel returns the trophy to the shelf. No WebGL or 3D rendering engine is used.


## Trophy cabinet styles

The athlete profile includes five switchable trophy cabinet finishes, all sharing the same lightweight SVG cabinet and fixed 3D-look award artwork:

1. **Wooden classic** — the original carved mahogany and blue-velvet cabinet
2. **Glass + wood** — warm oak with lightly tinted hinged glass doors
3. **High-tech slider** — graphite/blue metal, teal lighting and animated sliding glass doors with an open/close control
4. **Museum antique** — dark lacquer, burgundy velvet and antique-brass ornament
5. **Performance lab** — graphite, midnight blue and restrained teal performance lighting

The cabinet variants are CSS/SVG only. No WebGL, Three.js, canvas renderer or new runtime dependencies are used. The event trophy artwork and trophy-to-details dialog interaction are shared across all five variants. On mobile, the style choices become a horizontally scrollable strip.
