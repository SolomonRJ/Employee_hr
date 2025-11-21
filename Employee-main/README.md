## Enterprise Employee Management PWA

Monochrome, native-feel employee experience built with React + TypeScript + Vite, Tailwind, React Query, Workbox and IndexedDB. Every core workflow (punch, attendance, leave, payslips, approvals, helpdesk, mood check-ins) works offline with optimistic UI and background sync. The app is installable, runs fullscreen, and ships with an Express stub API plus OpenAPI contract for integration.

### Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn-inspired components + Framer Motion transitions
- React Query for data/state sync, IndexedDB (`idb`) for offline cache & queues
- Workbox (`vite-plugin-pwa`) precache + runtime caching + background sync
- Recharts for monochrome analytics, localforage/idb for local persistence
- Express stub backend (`server/`) covering every REST contract

---

## Getting started

```bash
# install dependencies
cd Employee-main
npm install

# start the PWA
npm run dev

# build for production
npm run build
npm run preview
```

The app registers a service worker (via `vite-plugin-pwa`) automatically. When you open it in Chrome (mobile or desktop) you can install it via the browser menu; it launches in standalone fullscreen with splash screen, offline cache and background sync enabled.

### Backend stub

An Express reference API is included for contract testing and integration scaffolding.

```bash
cd Employee-main/server
npm install
npm run dev   # starts on http://localhost:4000 by default
```

Endpoints implemented (see `docs/openapi.yaml` for schema):

- `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/refresh`
- Attendance: `POST /api/attendance/punch`, `GET /api/attendance/daily`, `GET /api/attendance/inout`
- Leave: `POST /api/leave/apply`, `GET /api/leave/balance`, `GET /api/leave/list`, `POST /api/leave/{id}/approve`
- Payslip: `GET /api/payslip/{year}/{month}`
- Helpdesk + tickets + approvals endpoints mirroring the product requirements

Front-end API clients currently talk to the offline-first data layer (IndexedDB + queue). Swap the base URLs in `services/*.ts` to hit the Express stub or a production backend.

---

## Key features

- **Native-feel PWA**: standalone display, orientation lock, custom icons, splash screen, zero pull-to-refresh flicker thanks to inner scroll containers and `overscroll-behavior`.
- **Offline-first data**: punches, leaves, tickets, moods, approvals stored in IndexedDB with Workbox background sync. Actions queue instantly and flush when network returns.
- **Secure punch stack**: face capture, GPS accuracy thresholding, SHA-256 payload hashing, optimistic UI + history, manager timeline views.
- **Complete employee console**: leave balances & applications, payslip analytics, attendance calendar, approvals desk with bulk actions, helpdesk chat, daily mood check-ins.
- **Strict monochrome system**: only white/black/grey palette with Android typography scale to match the design spec.

---

## Testing & quality gates

- `npm run build` (already executed) gates the CI build.
- **Unit tests** (to be added): queue processors, data mappers, Workbox helpers.
- **Playwright plan**: scripts for login, offline punch, leave apply + approval, payslip rendering, calendar events. Skeletons belong under `tests/e2e`.

---

## Deployment

- Configure environment variables via `.env` / `.env.production` (e.g. `VITE_API_BASE_URL`, auth issuer, map keys).
- Deploy static bundle to Vercel/Netlify/Firebase Hosting. Ensure server returns `service-worker-allowed: /`.
- Deploy Express/Firebase Functions backend separately (see `server/` README for Dockerfile hints) or connect to an existing enterprise API.
- Use HTTPS only, enable HTTP security headers (CSP, COOP, CORP) for PWA installability.

For more information inspect:

- `docs/openapi.yaml` – canonical REST contract
- `server/` – runnable backend stub
- `services/*.ts` – offline data engines and queue handlers
