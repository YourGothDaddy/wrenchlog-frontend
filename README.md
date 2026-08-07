# WrenchLog — Frontend

React SPA for WrenchLog. Talks to the [backend](../backend/README.md) over a REST API.

## Tech stack

- React (Vite)
- React Router
- Plain `fetch` via a small shared `api.js` client (no external HTTP library)

## Prerequisites

- Node.js (18+ recommended)
- The backend running (see backend README) — the frontend has nothing to show without it

## Environment variables

Create a `.env` file in the project root (same folder as `package.json`):

```
VITE_API_URL=http://localhost:8080
```

This is the backend's base URL. In production this is set to an empty string, so API calls become relative paths handled by the reverse proxy — don't hardcode `localhost` anywhere in the code; always go through `api.js`'s exported `BASE_URL`.

**Windows/PowerShell users:** avoid `Out-File` or `echo ... >` to create `.env` — these can silently add a UTF-8 BOM marker that Vite fails to parse correctly (causes `VITE_API_URL` to read as `undefined`, and requests end up going to the wrong place, e.g. `/undefined/api/...`). Use a plain text editor instead, or run:
```powershell
[System.IO.File]::WriteAllText("$PWD\.env", "VITE_API_URL=http://localhost:8080`n")
```

## Running locally

```
npm install
npm run dev
```

Opens at `http://localhost:5173` by default. Make sure the backend is running first, and that its CORS config (`app.cors.allowed-origin`) allows `http://localhost:5173`.

**If you've previously run another app on `localhost:5173`**, clear cookies for that origin first (DevTools → Application → Cookies) before testing — a leftover session cookie from something else can cause confusing behavior (e.g. the app thinking you're logged in against a different backend/database than the one currently running).

## Building for production

```
npm run build
```

Outputs static files to `dist/` — these get served by Nginx in production (see deployment notes), not by Vite's dev server.

## Project structure (high level)

```
views/        Route-level pages (GarageView, VehicleDashboardView, LoginForm, RegisterForm)
components/   Reusable pieces (Navbar)
hooks/        Custom hooks (useVehicleCatalog — the make/model/generation/modification cascade)
utils/api.js  Single shared fetch wrapper — handles base URL, cookies, error normalization
```

## Key notes

- **Auth:** no token is ever stored in JS (no `localStorage`, no manual header) — the browser handles the `auth_token` httpOnly cookie automatically. `api.js` sets `credentials: 'include'` so it's sent on every request. On mount, `App.jsx` calls `/api/auth/me` to determine login state.
- **Errors:** every screen shows a shared, styled error box on failed API calls (see `GarageView`/`VehicleDashboardView`) — if you add a new mutating call, follow the same `setErrorMessage(err.message || 'fallback')` pattern in its `.catch()`.
- **Styling:** shared visual tokens (panels, buttons, form inputs, status boxes) live in `index.css` as classes — prefer reusing those over new inline `style={{...}}` objects where the element fits an existing pattern.

## Deployment

Built via a multi-stage Docker image (Node build stage → Nginx serving the static output). Nginx also reverse-proxies `/api/*` to the backend container. See the root-level deployment notes for the full server setup.
