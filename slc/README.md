# Srii Lakshmi Cab — Billing System

A responsive web application for Srii Lakshmi Cab to digitize the paper billing system.

## Features

- **Authentication** — Secure login with JWT (username-based)
- **Create Bills** — Auto-generated bill numbers in `YY-XXX` format (e.g. `26-001`), resets yearly
- **Search & Filter Bills** — Text search by bill number, customer, vehicle; filter by date range, customer name, bill number range
- **Edit Bills** — Update existing bills with auto-recalculation of totals
- **Advance & Payable Amount** — Track advance paid and remaining payable amount
- **Invoice PDF** — Generate, download, print, and share professional PDF invoices
- **Dashboard** — Overview of total bills, monthly revenue, and recent trips
- **Responsive** — Works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js + Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **PDF**: Puppeteer (HTML → PDF)
- **Auth**: JWT + bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Supabase)
- npm

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET, etc.

npm install
npx prisma migrate deploy
npm run prisma:seed    # Creates default users
npm run dev            # Starts on http://localhost:5000
```

Default login credentials:
- Username: `sureshkumarn` / Password: `admin123`
- Username: `barath` / Password: `admin123`

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# For local dev, VITE_API_URL can stay empty (proxy handles it)

npm install
npm run dev            # Starts on http://localhost:5173
```

## Environment Variables

### `backend/.env`

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: `5000`) |
| `DATABASE_URL` | Prisma connection string (pooled, use pgbouncer for Supabase) |
| `DIRECT_URL` | Direct DB URL for migrations |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry duration (default: `7d`) |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins |

### `frontend/.env.local`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL for production (e.g. `https://your-backend.railway.app`). Leave empty for local dev. |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get profile |
| PUT | /api/auth/update-password | Change password |
| POST | /api/bills/create | Create bill |
| GET | /api/bills | List all bills (paginated) |
| GET | /api/bills/search?q={query} | Text search bills |
| GET | /api/bills/filter | Filter bills by date/customer/bill range |
| GET | /api/bills/dashboard | Dashboard stats |
| GET | /api/bills/customers | Customer name autocomplete |
| GET | /api/bills/{billNumber} | Get single bill |
| PUT | /api/bills/update/{billNumber} | Update bill |
| DELETE | /api/bills/{billNumber} | Delete bill |
| GET | /api/bills/{billNumber}/pdf | Download PDF invoice |
| GET | /api/bills/{billNumber}/invoice | Get invoice HTML |

## Project Structure

```
SLC-billing/
├── backend/
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   └── src/
│       ├── app.js
│       ├── controllers/
│       │   ├── authController.js
│       │   └── billController.js
│       ├── middleware/
│       │   └── authMiddleware.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── billRoutes.js
│       ├── services/
│       │   ├── billNumberService.js
│       │   └── pdfService.js
│       └── utils/
│           └── calculations.js
└── frontend/
    ├── .env.example
    ├── vercel.json
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── BillForm.jsx
        │   └── BillTable.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── CreateBill.jsx
        │   ├── SearchBills.jsx
        │   ├── EditBill.jsx
        │   └── ViewBill.jsx
        ├── services/
        │   └── api.js
        └── utils/
            └── calculations.js
```

## Deployment

> ⚠️ The backend uses **Puppeteer** for PDF generation which requires Chromium and **cannot run on Vercel serverless**. Deploy the backend on Railway or Render.

### Frontend → Vercel

1. Set **Root Directory** to `frontend`
2. Build command: `npm run build` | Output directory: `dist`
3. Add environment variable: `VITE_API_URL=https://your-backend.railway.app`

### Backend → Railway or Render

1. Set all environment variables from `backend/.env.example`
2. Set `CORS_ORIGIN=https://your-frontend.vercel.app`
3. Start command: `node src/app.js`

### Database → Supabase or Neon

- Use the pooled URL for `DATABASE_URL` and the direct URL for `DIRECT_URL`
- Run `npx prisma migrate deploy` after setting env vars
