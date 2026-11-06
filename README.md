# Contest Tracker

Contest Tracker is an automated, full-stack competitive programming aggregation and profile analytics platform. It aggregates upcoming contests across major coding platforms—Codeforces, LeetCode, and CodeChef—into a unified dashboard featuring real-time countdowns, dynamic search and filtering, one-click calendar integration, a personal watchlist, and cross-platform profile performance analytics.

---

## Architecture Overview

The system consists of three primary components:
1. **Frontend Client**: A responsive Single Page Application built with React 19, Vite, and Tailwind CSS.
2. **Backend API & Sync Service**: An Express.js service running on Node.js that exposes REST endpoints and executes background synchronization jobs via `node-cron`.
3. **Database Layer**: A serverless PostgreSQL instance hosted on Neon, managed via Prisma ORM.

### System Architecture Diagram

```mermaid
flowchart TD
    subgraph External_APIs["External Competitive Programming APIs"]
        CF["Codeforces API"]
        LC["LeetCode GraphQL API"]
        CC["CodeChef API"]
    end

    subgraph Backend_Service["Backend Service (Node.js & Express)"]
        CronEngine["Cron Sync Engine (Runs every 15 min)"]
        Scrapers["Platform Fetchers & Parsers"]
        APIRouter["REST API Router"]
        ProfileFetcher["Profile Analytics Service"]
        PrismaClient["Prisma ORM & PG Adapter"]
    end

    subgraph Cloud_Database["Database Tier"]
        NeonPostgres[("Neon Serverless PostgreSQL")]
    end

    subgraph Frontend_App["Frontend Client (React & Vite)"]
        Dashboard["Contests Dashboard & Countdown"]
        FilterEngine["Search & Multi-Platform Filters"]
        Watchlist["Watchlist Engine (Local Persistence)"]
        CalendarModule["Calendar Sync (Google Calendar & ICS)"]
        ProfileDashboard["Profile Analyzer Interface"]
    end

    CronEngine --> Scrapers
    CF --> Scrapers
    LC --> Scrapers
    CC --> Scrapers
    Scrapers --> PrismaClient
    PrismaClient <--> NeonPostgres

    Dashboard <--> APIRouter
    APIRouter <--> PrismaClient
    ProfileDashboard <--> APIRouter
    APIRouter --> ProfileFetcher
    ProfileFetcher --> CF
    ProfileFetcher --> LC
    ProfileFetcher --> CC

    Dashboard --> FilterEngine
    Dashboard --> Watchlist
    Dashboard --> CalendarModule
```

### Data Pipeline & Synchronization Sequence

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Cron Worker
    participant Fetchers as Scraper Modules
    participant Platforms as Third-Party APIs
    participant DB as Neon PostgreSQL
    participant Client as React Frontend
    participant Server as Express Server

    Note over Cron,DB: Automated Background Sync (Every 15 Minutes)
    Cron->>Fetchers: Trigger contest sync
    Fetchers->>Platforms: Query Codeforces, LeetCode, CodeChef
    Platforms-->>Fetchers: Return contest payloads
    Fetchers->>DB: Normalize schema, purge stale entries, batch insert
    DB-->>Fetchers: Commit confirmed

    Note over Client,Server: Client Request Flow
    Client->>Server: GET /api/contests?platform=CODEFORCES,LEETCODE
    Server->>DB: SELECT * FROM Contest WHERE platform IN (...) AND startTime >= NOW()
    DB-->>Server: Return contest records
    Server-->>Client: 200 OK (JSON payload)
    Client->>Client: Compute countdown ticker & render UI
```

---

## Core Capabilities

### 1. Multi-Platform Ingestion Engine
- **Codeforces**: Ingests directly from the official Codeforces API (`/api/contest.list`), filtering for contests in the `BEFORE` phase.
- **LeetCode**: Executes GraphQL queries against the LeetCode public API to retrieve upcoming weekly and biweekly contests.
- **CodeChef**: Queries the CodeChef contest endpoint, parsing ISO and standard timestamps into normalized UTC dates.
- **Deduplication & Hygiene**: Automatic cleanup routines purge historical contests older than 7 days to maintain lightweight database storage.

### 2. Live Countdown & Smart Search
- High-precision countdown ticker calculating days, hours, minutes, and seconds until the next nearest contest.
- Instant search and multi-platform toggle filters persisted in URL query parameters for shareability.

### 3. Calendar Integration
- **Google Calendar**: Generates timezone-agnostic URLs formatted in ISO UTC (`YYYYMMDDTHHmmssZ`) with pre-filled titles, links, and descriptions.
- **RFC 5545 iCalendar (`.ics`)**: Generates and downloads native calendar files compatible with Apple Calendar, Microsoft Outlook, and OS system calendars.

### 4. Personal Watchlist
- Allows users to star contests of interest.
- Uses client-side `localStorage` synchronization for zero-latency toggle states and persistent watchlists across sessions.

### 5. Profile Performance Analytics
- Aggregates user profile metrics across platforms from a single interface.
- Calculates total contests attended across Codeforces, LeetCode, and CodeChef.
- Displays Codeforces rating, peak rating, rank badges, and recent contest rating deltas.
- Displays LeetCode contest rating, global ranking, badges (Knight/Guardian), and problem-solving distribution (Easy, Medium, Hard).
- Displays CodeChef star ratings and national/global ranks.

### 6. Design System & Theme Engine
- Light theme by default with a dark mode toggle.
- CSS variables managed through Tailwind CSS with automated theme persistence in `localStorage`.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, date-fns, Axios |
| **Backend** | Node.js (ES Modules), Express.js, Axios, node-cron, CORS, dotenv |
| **Database & ORM** | Neon Serverless PostgreSQL, Prisma ORM 7, `@prisma/adapter-pg`, `pg` |
| **Deployment** | Vercel (Frontend SPA), Render (Backend Web Service), Neon (Cloud Database) |

---

## Database Schema

```prisma
enum Platform {
  CODEFORCES
  LEETCODE
  CODECHEF
}

model Contest {
  id           String   @id @default(cuid())
  platform     Platform
  name         String
  url          String
  startTime    DateTime
  durationSecs Int
  fetchedAt    DateTime @default(now())

  @@index([startTime])
  @@index([platform])
}
```

---

## API Specification

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Returns server status and current timestamp.
- **Response**:
```json
{
  "status": "ok",
  "time": "2026-11-06T12:00:00.000Z"
}
```

### 2. Get Upcoming Contests
- **Endpoint**: `GET /api/contests`
- **Query Parameters**:
  - `platform` (optional): Comma-separated list (`CODEFORCES,LEETCODE,CODECHEF`).
  - `search` (optional): Case-insensitive name filter.
  - `from` (optional): ISO date string lower bound.
  - `to` (optional): ISO date string upper bound.
- **Response**: Array of `Contest` objects ordered chronologically by `startTime` ascending.

### 3. Get Next Contest
- **Endpoint**: `GET /api/contests/next`
- **Description**: Retrieves the single nearest upcoming contest for the hero countdown banner.

### 4. Analyze User Profile
- **Endpoint**: `GET /api/user/profile`
- **Query Parameters**:
  - `cf` (optional): Codeforces username.
  - `lc` (optional): LeetCode username.
  - `cc` (optional): CodeChef username.
- **Response**:
```json
{
  "totalContestsAttended": 42,
  "codeforces": {
    "handle": "user",
    "rating": 1620,
    "maxRating": 1710,
    "rank": "expert",
    "maxRank": "expert",
    "contestsAttended": 25,
    "recentContests": [
      {
        "name": "Codeforces Round 950",
        "rank": 812,
        "oldRating": 1580,
        "newRating": 1620,
        "diff": 40,
        "date": "2026-09-01T15:00:00.000Z"
      }
    ]
  },
  "leetcode": {
    "username": "user",
    "rating": 1850,
    "globalRanking": 24100,
    "contestsAttended": 17,
    "totalSolved": 412,
    "easySolved": 150,
    "mediumSolved": 210,
    "hardSolved": 52
  },
  "codechef": null
}
```

---

## Local Development Setup

### Prerequisites
- Node.js (version 20 or higher recommended)
- npm or pnpm
- Access to a PostgreSQL database (local or a free [Neon](https://neon.tech) instance)

### 1. Clone the Repository
```bash
git clone https://github.com/ThePinak/contest-tracker.git
cd contest-tracker
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:
```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
PORT=3000
```

Push the database schema and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

Start the backend development server:
```bash
npm run dev
```
The backend API will be available at `http://localhost:3000`.

### 3. Frontend Setup
Open a second terminal window:
```bash
cd frontend
npm install
```

Optionally create a `.env` file inside `frontend`:
```env
VITE_API_BASE_URL="http://localhost:3000/api"
```

Start the frontend development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## Production Deployment

### Backend (Render Web Service)
1. Create a new **Web Service** on [Render](https://render.com) and link the repository.
2. Set **Root Directory** to `backend`.
3. Set **Runtime** to `Node`.
4. Set **Build Command** to:
   ```bash
   npm install && npx prisma generate
   ```
5. Set **Start Command** to:
   ```bash
   node src/index.js
   ```
6. Add the environment variable `DATABASE_URL` with your Neon PostgreSQL connection string.

### Frontend (Vercel)
1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework preset automatically detects **Vite**.
4. Under **Environment Variables**, set:
   ```env
   VITE_API_BASE_URL=https://<your-render-backend-url>/api
   ```
5. Deploy. Vercel utilizes the included `frontend/vercel.json` rewrite configuration to support client-side routing.

---

## License

This project is licensed under the ISC License.
