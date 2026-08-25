# FluentFeed — Speaking Evaluation System

An AI-powered speaking practice tool built for FluentFeed. Users sign up, get a random speaking topic, speak into their microphone, and receive an instant AI evaluation of their grammar, vocabulary, and overall fluency — along with actionable suggestions for improvement.

**Live app:** https://fluentfeed-practice-speak-gamma.vercel.app/
**Backend API:** https://fluentfeed-server-p63q.onrender.com

> **Note:** The backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take **30–50 seconds** to respond while the server wakes up.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Flow](#core-flow)
- [How Speech-to-Text Works (Web Speech API)](#how-speech-to-text-works-web-speech-api)
- [How AI Evaluation Works (Gemini API)](#how-ai-evaluation-works-gemini-api)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Assumptions & Design Decisions](#assumptions--design-decisions)

---

## Overview

The core loop is:

1. User signs up / logs in (JWT-based auth)
2. User is shown a random speaking topic
3. User clicks "Start Recording" and speaks for ~100–200 words; the browser transcribes speech to text live
4. User submits the transcript for evaluation
5. The backend sends the transcript to Google Gemini with a structured evaluation prompt
6. Gemini returns a grammar score, vocabulary score, overall score, and improvement suggestions
7. The result is saved to MongoDB (linked to the user) and displayed on the frontend
8. Users can revisit their evaluation history at any time

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

**Backend**
- Node.js + Express 5 + TypeScript
- MongoDB Atlas + Mongoose
- JWT authentication (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Google Gemini API (`@google/genai`) for evaluation

**Deployment**
- Frontend → Vercel
- Backend → Render

---

## Project Structure

```
fluentfeed-practice-speak/
├── client/                          # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts             # Axios instance, attaches JWT to requests
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── SignupForm.tsx
│   │   │   ├── common/
│   │   │   │   └── ProtectedRoute.tsx   # Redirects to /login if not authenticated
│   │   │   └── speaking/
│   │   │       ├── TopicCard.tsx
│   │   │       ├── RecordingInterface.tsx   # Web Speech API integration
│   │   │       └── ResultsDisplay.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Global auth state (user, token, login/logout)
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── SpeakingPage.tsx
│   │   │   └── HistoryPage.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx                  # Route definitions
│   │   └── main.tsx
│   ├── vercel.json                  # SPA rewrite rules for Vercel
│   └── package.json
│
├── server/                          # Node + Express + TypeScript backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                # MongoDB Atlas connection
│   │   ├── controllers/
│   │   │   ├── authController.ts    # signup, login
│   │   │   ├── topicController.ts   # random topic
│   │   │   └── evaluationController.ts  # evaluate + history
│   │   ├── data/
│   │   │   └── topics.ts            # Predefined speaking topics
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts    # JWT verification (protect route)
│   │   │   └── errorMiddleware.ts   # Centralized error handler
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Evaluation.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── topicRoutes.ts
│   │   │   └── evaluationRoutes.ts
│   │   ├── services/
│   │   │   └── geminiService.ts     # Gemini prompt + API call + response parsing
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── app.ts                   # Express app, middleware, route mounting
│   │   └── server.ts                # Entry point — connects DB, starts server
│   ├── .env.example
│   └── package.json
│
└── render.yaml                      # Render deployment config
```

---

## Core Flow

| Step | Where |
|---|---|
| Sign up / Log in | `LoginPage` / `SignupPage` → `POST /api/auth/*` → JWT stored client-side |
| Get a topic | `HomePage` → `GET /api/topics/random` |
| Record speech | `SpeakingPage` → `RecordingInterface` (Web Speech API, browser-only, no network call) |
| Submit for evaluation | `SpeakingPage` → `POST /api/evaluate` (protected route) |
| View result | `ResultsDisplay` renders scores + suggestions |
| View past attempts | `HistoryPage` → `GET /api/evaluate/history` (protected route) |

---

## How Speech-to-Text Works (Web Speech API)

The recording feature uses the browser's built-in `SpeechRecognition` API — no external speech-to-text service, no audio file upload, and no extra cost.

- When the user clicks **Start Recording**, the browser requests microphone access and begins listening.
- As the user speaks, the browser transcribes audio to text **in real time**, streaming back both interim (in-progress) and final results.
- The frontend appends each final transcript chunk to build up the full response text, and a live word count is shown so the user can track progress toward the 100–200 word target.
- When the user stops recording (or the API detects a pause), the final transcript is what gets sent to `POST /api/evaluate`.

**Important caveat:** `SpeechRecognition` is currently best supported in Chromium-based browsers (Chrome, Edge). It is not fully supported in Firefox or Safari, so the app is optimized for Chrome. This is a known browser-API limitation, not a bug in the implementation.

Because this all happens client-side, it costs nothing and adds no latency to the backend — the server only ever receives the final text transcript, not audio.

---

## How AI Evaluation Works (Gemini API)

When a transcript is submitted:

1. The backend (`geminiService.ts`) builds a structured prompt containing the topic and the transcript, instructing Gemini to act as a strict IELTS/TOEFL-style speaking examiner.
2. The prompt explicitly asks Gemini to check topic relevance first — off-topic or incoherent answers are capped at a low score, so the evaluation can't be gamed with unrelated text.
3. Gemini is called with a **JSON response schema** (`grammarScore`, `vocabularyScore`, `overallScore`, `suggestions`), so the model is constrained to return valid, structured JSON rather than free-form text — no fragile regex parsing needed.
4. Temperature is set low (`0.3`) to keep scoring consistent across repeated attempts on similar answers.
5. The parsed result is validated (all four fields checked for correct type) before being saved, and the whole evaluation — topic, transcript, scores, suggestions — is stored in MongoDB linked to the user's ID.
6. The result is returned to the frontend and rendered by `ResultsDisplay`.

If Gemini fails or returns something unparseable, the API responds with a clean `500` error and message rather than crashing, and the frontend shows an error state.

---

## API Documentation

Base URL (production): `https://fluentfeed-server-p63q.onrender.com`

### Auth

**`POST /api/auth/signup`**
```json
// Request
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }

// Response 201
{ "token": "<jwt>", "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" } }
```

**`POST /api/auth/login`**
```json
// Request
{ "email": "jane@example.com", "password": "secret123" }

// Response 200
{ "token": "<jwt>", "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" } }
```

### Topics

**`GET /api/topics/random`** — Public. Returns one random topic from the predefined list.
```json
{ "topic": "Describe a memorable trip you've taken." }
```

### Evaluation (protected — requires `Authorization: Bearer <token>`)

**`POST /api/evaluate`**
```json
// Request
{ "topic": "Describe a memorable trip you've taken.", "transcript": "Last year I visited..." }

// Response 201
{
  "id": "...",
  "topic": "Describe a memorable trip you've taken.",
  "transcript": "Last year I visited...",
  "grammarScore": 7,
  "vocabularyScore": 6,
  "overallScore": 7,
  "suggestions": ["Use more varied linking words", "Watch past tense agreement"],
  "createdAt": "2026-08-25T10:00:00.000Z"
}
```

**`GET /api/evaluate/history`** — Returns all past evaluations for the logged-in user, newest first.

### Health Check

**`GET /api/health`** — Used by Render for uptime monitoring.
```json
{ "status": "ok", "message": "FluentFeed server is running" }
```

---

## Database Schema

**User**
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase |
| password | String | hashed with bcrypt, min 6 chars |
| createdAt | Date | auto |

**Evaluation**
| Field | Type | Notes |
|---|---|---|
| userId | ObjectId | ref → User |
| topic | String | required |
| transcript | String | required |
| grammarScore | Number | 0–10 |
| vocabularyScore | Number | 0–10 |
| overallScore | Number | 0–10 |
| suggestions | String[] | 2–4 tips |
| createdAt | Date | auto |

---

## Local Setup

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas connection string
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Backend

```bash
cd server
npm install
cp .env.example .env
# fill in .env — see Environment Variables below
npm run dev
```
Server runs on `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
npm run dev
```
App runs on `http://localhost:5173`.

> Make sure `CLIENT_URL` in the server's `.env` matches the frontend's local URL for CORS to work, and that the frontend's API base URL points to `http://localhost:5000` in local development.

---

## Environment Variables

**Server (`server/.env`)**
| Variable | Description |
|---|---|
| `PORT` | Port the server runs on (default `5000`) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `CLIENT_URL` | Frontend origin, for CORS |
| `GEMINI_API_KEY` | API key from Google AI Studio |

**Client**
| Variable | Description |
|---|---|
| API base URL | Backend URL, configured in `src/api/axios.ts` (points to the Render URL in production) |

---

## Deployment

- **Frontend:** Deployed on **Vercel**. `vercel.json` includes a catch-all rewrite to `index.html` so client-side routing (React Router) works correctly on page refresh/direct links.
- **Backend:** Deployed on **Render** using `render.yaml`. The build step runs `npm install --include=dev && npm run build` (compiles TypeScript to JS via `tsc`), and `npm start` runs the compiled output (`dist/server.js`). Render's health check hits `/api/health`.
- Environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `GEMINI_API_KEY`) are set directly in the Render dashboard rather than committed to the repo.

---

## Assumptions & Design Decisions

- **Speech-to-text runs entirely in the browser** (Web Speech API) instead of sending audio to a server — this keeps the system free and fast for this assignment's scope, though it does limit browser support to Chromium-based browsers.
- **JWT auth without refresh token rotation** — kept intentionally simple for this assignment; access tokens are stored client-side and attached via an Axios interceptor.
- **A fixed, predefined topic list** is used rather than AI-generated topics, keeping the `/api/topics/random` endpoint fast and free.
- **Gemini's structured JSON response schema** is used instead of asking for free-text and parsing it, to make the evaluation reliable and reduce parsing failures.
- **The current architecture calls Gemini synchronously on every submission.** This is intentional for this assignment's scope (UI/UX + auth), but is not how I'd design it at scale — see the accompanying system design document for the limitations of this approach and the architecture I'd propose for ~10,000 evaluations/day (caching, queues, background workers, rate limiting, etc.).