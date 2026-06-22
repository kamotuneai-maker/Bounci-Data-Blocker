# Bounci — AI Compliance Monitor

Bounci (formerly "KAM AI") monitors employee usage of AI tools (ChatGPT, Claude, Gemini, Copilot) and flags sensitive data leaks (SSNs, credit cards, API keys, etc.) before they leave the company.

## How the pieces fit together

```
Chrome Extension  ──captures prompts──▶  Backend API  ──serves data──▶  Dashboard
(extension/)                            (backend/)                    (dashboard/)
```

1. **extension/** — Manifest V3 Chrome extension ("Benny the Bouncer"). Injects a content script into AI chat sites, captures prompts, and sends them to the backend.
2. **backend/** — Node.js/Express + PostgreSQL API. Receives captured prompts, scans them for sensitive data (`riskEngine.js`), stores results, and exposes dashboard endpoints. Deployable to Railway.
3. **dashboard/** — React + Vite admin dashboard. Login, usage summary, risk reports, and per-user activity, backed by the API in `backend/`.

## Setup

Each component has its own dependencies and run instructions — see:
- [`extension/README.md`](./extension/README.md)
- [`backend/README.md`](./backend/README.md)
- `dashboard/` — `npm install && npm run dev` (Vite dev server)

To run the full stack locally: start `backend/` first (needs a `DATABASE_URL`), point the dashboard's API base URL at it, then load `extension/` as an unpacked extension in Chrome (`chrome://extensions` → Developer mode → Load unpacked).

## Status

Phase 1 (detection) is built: extension captures prompts, backend scans and stores them, dashboard reports on them. See `backend/README.md` for the roadmap (Phase 2+: prevention features).
