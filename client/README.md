# FluentFeed — Client (Frontend)

React + TypeScript + Vite + Tailwind CSS frontend for the FluentFeed Speaking Evaluation System.

**Live app:** https://fluentfeed-practice-speak-gamma.vercel.app/

> The overall project README (root of the repo) covers the full system — backend, API docs, database schema, and how Web Speech API + Gemini evaluation work together. This README covers the frontend specifically.

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — dev server & build tool
- **Tailwind CSS 4**
- **React Router 7** — routing
- **Axios** — API calls, with a request interceptor that attaches the JWT

---

## Project Structure

```
client/
├── src/
│   ├── api/
│   │   └── axios.ts             # Axios instance — base URL from VITE_API_URL, attaches JWT
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── common/
│   │   │   └── ProtectedRoute.tsx   # Redirects to /login if no authenticated user
│   │   └── speaking/
│   │       ├── TopicCard.tsx
│   │       ├── RecordingInterface.tsx   # Web Speech API — mic capture, live transcript
│   │       └── ResultsDisplay.tsx       # Scores + suggestions
│   ├── context/
│   │   └── AuthContext.tsx      # Global auth state — user, signup, login, logout
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── SpeakingPage.tsx
│   │   └── HistoryPage.tsx
│   ├── types/
│   │   └── index.ts             # Shared TS types (User, AuthResponse, Evaluation, etc.)
│   ├── App.tsx                  # Route definitions
│   └── main.tsx                 # App entry point
├── index.html
├── vercel.json                  # SPA rewrite rules for client-side routing on Vercel
├── vite.config.ts
└── package.json
```

---

## Routes

| Path | Page | Protected? |
|---|---|---|
| `/login` | Login | No |
| `/signup` | Signup | No |
| `/` | Home (get a topic) | Yes |
| `/speaking` | Recording + submit for evaluation | Yes |
| `/history` | Past evaluations | Yes |

Protected routes are wrapped in `<ProtectedRoute>`, which checks `AuthContext` and redirects to `/login` if there's no logged-in user.

---

## Auth Flow (Frontend)

- `AuthContext` holds the current `user` and exposes `signup`, `login`, and `logout`.
- On successful signup/login, the JWT and user object returned by the API are stored in `localStorage` (`token`, `user`) and loaded back into context on app start.
- `src/api/axios.ts` is a shared Axios instance whose request interceptor automatically attaches `Authorization: Bearer <token>` to every outgoing request if a token is present — so individual components never have to handle this manually.
- `logout` simply clears `localStorage` and resets the context.

---

## Recording Flow (Web Speech API)

`RecordingInterface.tsx` uses the browser's native `SpeechRecognition` API:

- Requests microphone permission and starts listening on "Start Recording"
- Streams back a live transcript as the user speaks, with a running word count (target: 100–200 words)
- On stop, the final transcript is handed off to `SpeakingPage`, which submits it to the backend via `POST /api/evaluate`

**Browser support note:** works reliably in Chrome/Edge (Chromium-based). Firefox and Safari have limited or no support for `SpeechRecognition` — this is a browser API limitation, not something fixable purely on the frontend.

---

## Local Development

### Prerequisites
- Node.js v18+
- The backend running locally or the deployed backend URL

### Setup

```bash
cd client
npm install
```

Create a `.env` file in `client/` (see below), then:

```bash
npm run dev
```

App runs at `http://localhost:5173`.

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` (local) or `https://fluentfeed-server-p63q.onrender.com/api` (production) |

> Vite only exposes env vars prefixed with `VITE_` to client code. After adding/changing `.env`, restart the dev server for changes to take effect.

### Other Scripts

```bash
npm run build     # Type-checks (tsc -b) and builds for production
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

---

## Deployment (Vercel)

- Deployed as a static Vite build on **Vercel**.
- `vercel.json` includes a catch-all rewrite (`/(.*) → /index.html`) so React Router's client-side routes work correctly on refresh and direct navigation.
- `VITE_API_URL` is set in the Vercel project's Environment Variables dashboard, pointing to the deployed Render backend: `https://fluentfeed-server-p63q.onrender.com/api`.

> Since the backend is on Render's free tier, the very first API call after inactivity can take 30–50 seconds while the server cold-starts. This is expected and not a frontend bug.