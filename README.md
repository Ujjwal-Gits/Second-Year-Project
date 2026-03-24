# HamroYatra — Nepal's Premier Travel Platform

A full-stack travel booking and management platform built for Nepal's tourism industry. Connects verified travel agents with travellers through a modern, AI-powered interface.

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL with Sequelize ORM
- **Auth:** JWT (HTTP-only cookies), Google OAuth 2.0, OTP email verification
- **AI:** Google Gemini API (trip planning)
- **Email:** Nodemailer (Gmail SMTP)

---

## Project Structure

```
hamroyatra/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/      # Shared UI components (Navbar, Footer, etc.)
│       ├── pages/           # Route-level pages
│       ├── dashboard/       # Agent dashboard
│       ├── dashboard_traveller/  # Traveller dashboard
│       ├── dashboard_super/ # Super admin dashboard
│       └── explore/         # Explore listings & agent profiles
└── server/          # Express backend
    ├── config/      # Database connection
    ├── controllers/ # Route logic
    ├── middleware/  # Auth middleware
    ├── models/      # Sequelize models
    ├── routes/      # API routes
    └── services/    # OTP, license watcher
```

---

## Team & Branch Structure

| Branch           | Member           | Responsibility                                                                       |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `main`           | —                | Stable production-ready code                                                         |
| `ujjwal`         | Ujjwal (Lead)    | Home page, server setup, DB connection, backend API, dashboard integration           |
| `anjali-aakriti` | Anjali & Aakriti | Traveller dashboard, Agent dashboard frontend                                        |
| `puskar`         | Puskar           | Auth system (login/register/OTP/Google OAuth), Verification page, Advertisement page |
| `aashika`        | Aashika          | Profile page, Verified Partners page, Database schema/models                         |

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- A Gmail account with App Password enabled

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
# Fill in your values in .env
node index.js
```

### 3. Setup the frontend

```bash
cd hamroyatra/client
npm install
npm run dev
```

The frontend runs on `http://localhost:5174` and the backend on `http://localhost:5000`.

---

## Environment Variables

Copy `hamroyatra/server/.env.example` to `hamroyatra/server/.env` and fill in all values. See the example file for descriptions of each variable.

**Never commit your `.env` file.** It is listed in `.gitignore`.

---

## Key Features

- Verified travel agent registration with company details
- Traveller registration with Google OAuth or email + OTP
- AI-powered trip planning (Gemini API) with rate limiting
- Smart preference-based listing recommendations
- Real-time booking management for agents
- Trip progress tracker for travellers
- In-platform messaging between travellers and agents
- Super admin dashboard for platform oversight
- Guide license expiry monitoring

---

## License

This project is developed as a Second Year Project (SYP) for academic purposes.
