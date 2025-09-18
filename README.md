# MutPark Commerce Platform

MutPark is a bilingual e-commerce platform that connects Korean food suppliers with customers in Türkiye. The project follows the PRD roadmap and ships an MVP that covers product browsing, cart & order flows, localized UI, and payment handshakes with iyzico-ready stubs.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4, Zustand state store
- **Backend**: Next.js API routes, Prisma ORM, JWT-based auth, REST endpoints
- **Database**: MySQL (tested with 8.x, Railway-compatible)
- **Infrastructure**: Dockerfile for container builds, Prisma schema & seed scripts

## Project Structure

```
├─ prisma/                 # Database schema & seed script
├─ src/
│  ├─ app/                 # App router pages, API routes, layouts
│  ├─ components/          # UI components (layout, auth, products, cart, checkout, account)
│  ├─ hooks/               # Zustand stores and custom hooks
│  ├─ i18n/                # Locale config and dictionaries (ko, tr)
│  ├─ lib/                 # Prisma client, auth helpers, validators, utilities
│  └─ services/            # Auth/session orchestration
├─ Dockerfile              # Production container definition
├─ .env.example            # Environment variable template
└─ README.md
```

## Getting Started

### 1. Prerequisites

- Node.js 20+
- npm 10+
- MySQL 8 (local or managed; Railway MySQL works out-of-the-box)

### 2. Configure Environment

Duplicate `.env.example` and update the variables:

```bash
cp .env.example .env
```

Set `DATABASE_URL` to your MySQL connection string and provide a strong `JWT_SECRET`. For Railway, paste the connection URL provided by the service.

### 3. Install Dependencies

> ℹ️ If the dev container cannot reach npm, run the following commands after cloning on a connected machine.

```bash
npm install
```

### 4. Database Setup

Push the Prisma schema and seed baseline products:

```bash
npm run db:push
npm run db:seed
```

### 5. Run the App Locally

```bash
npm run dev
```

Visit `http://localhost:3000/ko` (Korean) or `http://localhost:3000/tr` (Turkish).

## Key Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run db:push` | Push Prisma schema to the database |
| `npm run db:seed` | Seed baseline products |

## Core Features Delivered (Phase 1)

- ✅ JWT + refresh-token auth (register, login, logout, refresh)
- ✅ Google/Kakao social login endpoint stubs with token verification flow hooks
- ✅ Profile API (view/update), address CRUD, cart, order lifecycle APIs
- ✅ Product CRUD with pagination & localized content, slug lookups
- ✅ iyzico checkout + webhook scaffolding for payment confirmation
- ✅ Locale-aware storefront (ko/tr), filters, halal & spice indicators
- ✅ Cart state via Zustand, checkout flow with address selection
- ✅ Account area (profile update, order listing, address manager)
- ✅ Dockerfile for containerized deploys and Prisma database schema

Progress is mirrored back into the PRD checklist (`.github/prompt/PRD.md`).

## API Overview

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/auth/register` | POST | Create account + issue session cookies |
| `/api/auth/login` | POST | Login via email/password |
| `/api/auth/social/[provider]` | POST | Social login with Google / Kakao tokens |
| `/api/auth/logout` | POST | Destroy session cookies |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/profile` | GET/PATCH | Fetch or update profile details |
| `/api/products` | GET/POST | List products or create (admin) |
| `/api/products/[id]` | GET/PUT/DELETE | Product detail & admin mutations |
| `/api/products/slug/[slug]` | GET | Product detail by slug |
| `/api/cart` | GET/POST/PUT/DELETE | Cart management |
| `/api/orders` | GET/POST | Order history & creation |
| `/api/addresses` | GET/POST | List/create addresses |
| `/api/addresses/[id]` | PATCH/DELETE | Update or remove address |
| `/api/payment/iyzico/checkout` | POST | Initiate iyzico checkout session |
| `/api/payment/iyzico/webhook` | POST | Handle iyzico result callbacks |

All protected routes expect the `mutpark-token` cookie or `Authorization: Bearer` header.

## Deployment on Railway

1. **Provision services**
   - Create a MySQL database service and note the connection URL
   - Create a Node.js service for the web app
2. **Set environment variables** on the web service:
   - `DATABASE_URL` = MySQL connection string
   - `JWT_SECRET` = strong 32+ char string
   - `NEXT_PUBLIC_APP_URL` = public Railway URL (e.g. `https://your-app.up.railway.app`)
   - `IYZICO_API_KEY` / `IYZICO_SECRET_KEY` when available
3. **Enable build & start commands**
   - Build: `npm install && npm run build`
   - Start: `npm run start`
4. **Database migrations** can run automatically via `npm run db:push` in a Railway deploy hook or manually via `railway run`.
5. Optionally attach the provided `Dockerfile` if you prefer container builds.

## Testing & Next Steps

- Linting: `npm run lint`
- Add unit/integration tests (not included yet)
- Phase 2/3 items remain open in the PRD checklist (search, logistics, community, performance tuning, etc.)

## Notes

- Social login handlers expect valid Google/Kakao tokens and are structured for real-world integration but require provider credentials.
- Payment webhook currently records callbacks and toggles order/payment status; connect to iyzico REST API in production.
- The repository is configured for bilingual UX; add more locales by extending `src/i18n`.
