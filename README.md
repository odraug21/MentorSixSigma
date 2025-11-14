
# MentorSuites Clean Monorepo

This is a cleaned split of your project into **frontend** and **backend** suitable for separate local dev and a single Vercel deployment with monorepo routing.

## Structure
- `frontend/` — React app (Vite/CRA). Build outputs to `dist/`.
- `backend/` — Node/Express API. Entry: `server.js`.

## Local Development
```bash
# Terminal 1
cd backend
npm i
npm run dev    # or: node server.js

# Terminal 2
cd ../frontend
npm i
npm run dev
```

## Vercel (single repo, routes-based)
- Uses `vercel.json` at repo root:
  - All `/api/*` routes go to `backend/server.js`
  - All other routes serve `frontend/dist` after build

## Notes
- Remove any duplicate or stale files after validating.
- Ensure `frontend/package.json` has a proper build script (`"build": "vite build"` or CRA).
- Ensure `backend/server.js` exports a handler compatible with serverless (module.exports = app) if needed.
