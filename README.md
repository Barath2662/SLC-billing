# Srii Lakshmi Cab - Billing System

A responsive web application for Srii Lakshmi Cab to digitize the paper billing system.

## Features

- **Authentication**: Secure login with JWT
- **Create Bills**: Auto-generated bill numbers (SLC-0001, SLC-0002, ...)
- **Search Bills**: Search by bill number, customer name, vehicle number
- **Edit Bills**: Update existing bills with auto-recalculation
- **Invoice PDF**: Generate, download, print, and share PDF invoices
- **Dashboard**: Overview of total bills, monthly revenue, recent trips
- **Responsive**: Works on desktop, tablet, and mobile browsers
- **API-first**: Backend ready for future mobile app integration

## Tech Stack

- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js + Prisma ORM
- **Database**: PostgreSQL
- **PDF**: Puppeteer (HTML → PDF)
- **Auth**: JWT + bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### 1. Setup Database

Create a PostgreSQL database:

```sql
CREATE DATABASE srii_lakshmi_cab;
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials

npm install
npx prisma migrate dev --name init
npm run prisma:seed    # Creates default admin user
npm run dev
```

Default admin credentials:
- Email: admin@sriilakshmicab.com
- Password: admin123

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Access

Open http://localhost:5173 in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| GET | /api/auth/profile | Get profile |
| POST | /api/bills/create | Create bill |
| GET | /api/bills | List all bills |
| GET | /api/bills/search?q={query} | Search bills |
| GET | /api/bills/{billNumber} | Get bill |
| PUT | /api/bills/update/{billNumber} | Update bill |
| DELETE | /api/bills/{billNumber} | Delete bill |
| GET | /api/bills/{billNumber}/pdf | Download PDF |
| GET | /api/bills/dashboard | Dashboard stats |

## Project Structure

```
srii-lakshmi-cab-billing/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
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
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── BillForm.jsx
│       │   └── BillTable.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── CreateBill.jsx
│       │   ├── SearchBills.jsx
│       │   ├── EditBill.jsx
│       │   └── ViewBill.jsx
│       ├── services/
│       │   └── api.js
│       └── utils/
│           └── calculations.js
└── README.md
```

## Deployment

- **Frontend**: Vercel or Netlify
- **Backend**: Render or Railway
- **Database**: Neon PostgreSQL or Supabase PostgreSQL
# SLC-billing
