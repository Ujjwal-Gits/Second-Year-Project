# HamroYatra — Nepal's Premier Travel Platform

A full-stack travel booking and management platform built for Nepal's tourism industry. Connects verified travel agents with travellers through a modern, AI-powered interface.

Live: [hamroyatra.ujjwalrupakheti.com.np](https://hamroyatra.ujjwalrupakheti.com.np)

---

## Tech Stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, react-helmet-async   |
| Backend  | Node.js, Express.js                                               |
| Database | PostgreSQL with Prisma ORM                                        |
| Auth     | JWT (HTTP-only cookies), Google OAuth 2.0, OTP email verification |
| AI       | Google Gemini API (AI trip planner)                               |
| Email    | Nodemailer (Gmail SMTP) + Resend API                              |
| Deploy   | Vercel (frontend) · Render (backend)                              |

---

## Project Structure

```
hamroyatra/
├── client/                      # React frontend (Vite)
│   └── src/
│       ├── components/          # Shared UI (Navbar, Footer, AuthModal, etc.)
│       ├── pages/               # Static pages (PlanPage, ContactUs, etc.)
│       ├── explore/             # Explore listings & agent profiles
│       ├── dashboard/           # Agent dashboard
│       ├── dashboard_traveller/ # Traveller dashboard
│       └── dashboard_super/     # Super admin dashboard
└── server/                      # Express backend
    ├── config/                  # DB connection (Prisma client)
    ├── controllers/             # Route logic (auth, etc.)
    ├── middleware/              # JWT auth middleware
    ├── prisma/                  # schema.prisma + prisma.config.ts
    ├── routes/                  # API route groups
    └── services/                # OTP service, guide license watcher
```

---

## Key Features

- Verified travel agent registration with company details and document upload
- Traveller registration via email + OTP or Google OAuth
- AI-powered trip planner (Gemini API) with rate limiting
- Smart preference-based listing recommendations (session + booking history signals)
- Real-time booking management for agents
- Trip progress tracker for travellers
- In-platform messaging between travellers and agents
- Review and rating system
- Guide license expiry monitoring (automated background service)
- Super admin dashboard for platform oversight
- SEO-optimised pages with per-route meta tags and sitemap

---

## Database Models

| Model            | Description                                    |
| ---------------- | ---------------------------------------------- |
| `Agent`          | Travel agency accounts                         |
| `Traveller`      | Traveller accounts (email or Google OAuth)     |
| `Listing`        | Packages, treks, hotels listed by agents       |
| `Booking`        | Booking records linking travellers + listings  |
| `Review`         | Ratings and reviews on listings                |
| `Guide`          | Licensed guides attached to agents             |
| `Message`        | In-platform messages                           |
| `Notification`   | System notifications                           |
| `ActivityLog`    | Agent activity audit trail                     |
| `Follower`       | Traveller follows agent                        |
| `ListingView`    | View tracking for recommendation engine        |
| `UserPreference` | Cached preference profiles for personalisation |

---

## API Routes

| Prefix           | File                   | Description                                      |
| ---------------- | ---------------------- | ------------------------------------------------ |
| `/api/auth`      | `routes/auth.js`       | Login, register, OTP, password reset, verify     |
| `/api/auth`      | `routes/googleAuth.js` | Google OAuth flow                                |
| `/api/dashboard` | `routes/dashboard.js`  | Agent + traveller dashboard data                 |
| `/api/public`    | `routes/public.js`     | Public listings, agent profiles, recommendations |
| `/api/agent`     | `routes/agent.js`      | Agent-specific actions                           |
| `/api/plan`      | `routes/plan.js`       | AI trip planner (Gemini)                         |

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- A Gmail account with App Password enabled
- Google Cloud project with OAuth 2.0 credentials
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/Ujjwal-Gits/Second-Year-Project.git
cd Second-Year-Project
```

### 2. Setup the backend

```bash
cd hamroyatra/server
npm install
cp .env.example .env
# Fill in your values — see Environment Variables section below
node index.js
```

The server auto-creates the PostgreSQL database if it doesn't exist yet.

### 3. Setup the frontend

```bash
cd hamroyatra/client
npm install
npm run dev
```

Frontend runs on `http://localhost:5174`, backend on `http://localhost:5000`.

---

## Environment Variables

Copy `hamroyatra/server/.env.example` to `hamroyatra/server/.env` and fill in all values.

| Variable               | Description                                                                |
| ---------------------- | -------------------------------------------------------------------------- |
| `PORT`                 | Server port (default `5000`)                                               |
| `NODE_ENV`             | `development` or `production`                                              |
| `DB_NAME`              | PostgreSQL database name                                                   |
| `DB_USER`              | PostgreSQL user                                                            |
| `DB_PASS`              | PostgreSQL password                                                        |
| `DB_HOST`              | PostgreSQL host (e.g. `localhost`)                                         |
| `DB_PORT`              | PostgreSQL port (default `5432`)                                           |
| `JWT_SECRET`           | Secret key for signing JWTs                                                |
| `ADMIN_EMAIL`          | Super admin login email                                                    |
| `ADMIN_PASS`           | Super admin login password                                                 |
| `GEMINI_API_KEY`       | Google Gemini API key for AI trip planner                                  |
| `SMTP_EMAIL`           | Gmail address for sending OTP emails                                       |
| `SMTP_PASS`            | Gmail App Password (not your account password)                             |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID                                                     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                                                 |
| `GOOGLE_CALLBACK_URL`  | OAuth callback URL (e.g. `http://localhost:5000/api/auth/google/callback`) |
| `CLIENT_URL`           | Frontend URL for OAuth redirect (e.g. `http://localhost:5174`)             |

For the frontend, set `VITE_API_URL` in `hamroyatra/client/.env`:

```
VITE_API_URL=http://localhost:5000
```

**Never commit your `.env` files.** Both are listed in `.gitignore`.

---

## Deployment

| Service  | Platform | URL                                           |
| -------- | -------- | --------------------------------------------- |
| Frontend | Vercel   | https://hamroyatra.ujjwalrupakheti.com.np     |
| Backend  | Render   | https://second-year-project-heoc.onrender.com |

The frontend uses `vercel.json` to rewrite all routes to `index.html` for SPA routing.

---

## Team & Branch Structure

| Branch    | Member        | Responsibility                                                                                            |
| --------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| `main`    | —             | Stable production-ready code. All branches merge here via Pull Request.                                   |
| `ujjwal`  | Ujjwal (Lead) | Home page, server setup, DB connection, backend API routes, dashboard integration, AI plan, explore page  |
| `anjali`  | Anjali        | Agent dashboard frontend (bookings, listings, analytics, team, calendar)                                  |
| `aakriti` | Aakriti       | Traveller dashboard frontend (bookings, trip progress, reviews, messages)                                 |
| `puskar`  | Puskar        | Auth system (login/register/OTP/Google OAuth), Verification page, Advertisement page, backend auth routes |
| `aashika` | Aashika       | Profile page, Verified Partners page, all database models/schema                                          |

---

## License

Developed as a Second Year Project (SYP) for academic purposes.
