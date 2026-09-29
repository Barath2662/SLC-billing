# Srii Lakshmi Cab — Billing System

## Complete Project Documentation

**Last Updated:** 19 April 2026  
**Version:** 1.0.0  
**Status:** Production Ready with Optimized PDF Generation

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Login Credentials](#login-credentials)
6. [API Endpoints](#api-endpoints)
7. [Data Flow & Architecture](#data-flow--architecture)
8. [Frontend Components](#frontend-components)
9. [Backend Services](#backend-services)
10. [Setup & Deployment](#setup--deployment)
11. [Environment Variables](#environment-variables)
12. [Features Breakdown](#features-breakdown)

---

## 🎯 Project Overview

**Srii Lakshmi Cab Billing System** is a full-stack web application designed to digitize the paper-based billing process for a taxi/cab service. The system allows operators to create, manage, search, and generate professional PDF invoices for completed trips.

### Key Capabilities

- ✅ **User Authentication** — Secure JWT-based login system
- ✅ **Bill Management** — Create, read, update, delete operations with auto-generated bill numbers
- ✅ **Intelligent Search** — Text-based search and advanced filtering by date range, customer, and bill number range
- ✅ **Professional Invoices** — PDF generation with exact format matching the ViewBill display (Puppeteer-based)
- ✅ **Dashboard Analytics** — Real-time statistics on total bills, monthly revenue, and recent trips
- ✅ **Responsive Design** — Fully functional on desktop, tablet, and mobile devices
- ✅ **Customer Database** — Auto-populated customer names for quick bill creation
- ✅ **Advance & Payable Tracking** — Track paid advance and remaining payable amounts
- ✅ **3-Tier PDF Fallback** — Reliable PDF generation: Backend → Frontend → Browser Print

### Business Model

- **Primary Users:** Cab operators, office staff, management
- **Usage:** Daily invoice generation, billing records, revenue tracking
- **Data Retention:** All invoices permanently stored with audit trail
- **Security:** JWT token-based authentication with 7-day expiry (configurable)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Hooks
- **Build Tool:** Vite (lightning-fast development and production builds)
- **Styling:** Tailwind CSS (utility-first CSS framework)
- **Routing:** React Router v6
- **State Management:** localStorage for auth tokens
- **HTTP Client:** Axios with interceptors for auth headers
- **UI Components:** React Icons, React Hot Toast (notifications)
- **Form Handling:** React Hook Form for efficient form management
- **PDF Generation (Fallback):** html2pdf.js, jsPDF, html2canvas

### Backend
- **Runtime:** Node.js (v14+ required)
- **Framework:** Express.js (minimalist web framework)
- **Database ORM:** Prisma (type-safe database access)
- **Database:** PostgreSQL (Supabase or self-hosted)
- **Authentication:** JWT (jsonwebtoken) with bcryptjs password hashing
- **PDF Generation:** Puppeteer (headless Chrome for HTML → PDF)
- **Validation:** express-validator (input validation middleware)
- **Development:** Nodemon (auto-restart on file changes)

### Deployment
- **Frontend Hosting:** Vercel (zero-config deployment, optimized for Vite)
- **Backend Hosting:** Render (auto-deploy from Git, free tier available)
- **Database Hosting:** Supabase (PostgreSQL with pgbouncer pooling)

### DevOps
- **Version Control:** Git/GitHub
- **CI/CD:** Auto-deploy on GitHub push (Vercel & Render)
- **Environment:** Docker-ready (optional container support)

---

## 📁 Project Structure

```
SLC-billing/
├── backend/                          # Node.js + Express backend
│   ├── src/
│   │   ├── app.js                   # Express app setup, CORS, routes
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login, profile, password change
│   │   │   └── billController.js    # CRUD, search, filter, PDF, stats
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Auth endpoints
│   │   │   └── billRoutes.js        # Bill CRUD endpoints
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # JWT token verification
│   │   ├── services/
│   │   │   ├── billNumberService.js # Auto-generates YY-XXX format
│   │   │   ├── pdfService.js        # Invoice HTML template generator
│   │   │   └── pdfkitService.js     # Puppeteer PDF rendering engine
│   │   └── utils/
│   │       └── calculations.js      # Bill calculations (totals, charges)
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema (User, Bill, Customer)
│   │   ├── seed.js                  # Initial user data seeding
│   │   └── migrations/              # Database migration history
│   ├── scripts/
│   │   └── ensureChrome.js         # Chrome setup for Render deployment
│   ├── package.json
│   ├── package-lock.json
│   ├── render.yaml                  # Render deployment config
│   └── .env                         # Environment variables (not in git)
│
├── frontend/                         # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx                # React entry point
│   │   ├── index.css               # Global Tailwind + custom styles
│   │   ├── App.jsx                 # Router configuration
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation with user menu
│   │   │   ├── BillForm.jsx        # Shared bill input form (create/edit)
│   │   │   ├── BillTable.jsx       # Bill list display with pagination
│   │   │   └── SearchBillTable.jsx # Search results table
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page (public)
│   │   │   ├── Dashboard.jsx       # Main dashboard with stats
│   │   │   ├── CreateBill.jsx      # New bill creation form
│   │   │   ├── SearchBills.jsx     # Search + filter interface
│   │   │   ├── ViewBill.jsx        # Bill details + PDF download/share/print
│   │   │   ├── EditBill.jsx        # Update existing bill
│   │   │   └── ChangePassword.jsx  # Password change page
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + API calls
│   │   └── utils/
│   │       └── calculations.js     # Shared calculation utilities
│   ├── public/                     # Static assets
│   ├── index.html                  # HTML entry point
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   ├── vercel.json                 # Vercel deployment config
│   └── .env.local                  # Frontend env vars (not in git)
│
├── DEPLOYMENT.md                    # Deployment instructions
├── README.md                        # Quick start guide
├── PROJECT_DOCUMENTATION.md        # This file (complete docs)
├── todo.txt                        # Development tasks
├── vercel.json                     # Root Vercel config
└── .git/                          # Git repository

Database Schema (PostgreSQL):
├── users table              # System users (admin accounts)
├── bills table              # Individual invoices
└── customers table          # Customer reference data
```

---

## 🗄️ Database Schema

### User Model (users table)

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `username` | STRING | UNIQUE, NOT NULL | Login username |
| `name` | STRING | NOT NULL | Full display name |
| `email` | STRING | UNIQUE, NULLABLE | Contact email |
| `password_hash` | STRING | NOT NULL | Bcrypt hashed password |
| `role` | STRING | DEFAULT: 'admin' | User role (currently all 'admin') |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | Account creation time |

**Status:** 2 default users seeded (see [Login Credentials](#login-credentials))

---

### Bill Model (bills table)

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| **Identification** |
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique bill internal ID |
| `bill_number` | STRING | UNIQUE, NOT NULL | Invoice number (YY-XXX format, e.g., "26-001") |
| **Customer Information** |
| `customer_name` | STRING | NOT NULL | Name of customer |
| `travel_details` | STRING | NULLABLE | Trip description (route, purpose) |
| `gstin` | STRING | NULLABLE | GST registration number |
| **Invoice Information** |
| `date` | TIMESTAMP | DEFAULT: NOW() | Invoice issue date |
| `vehicle_number` | STRING | NULLABLE | Cab/vehicle registration plate |
| `multiple_days` | BOOLEAN | DEFAULT: FALSE | Multi-day trip indicator |
| `trip_date` | TIMESTAMP | NULLABLE | Start date of trip |
| `trip_end_date` | TIMESTAMP | NULLABLE | End date if multi-day |
| **Trip Timing** |
| `starting_time` | STRING (HH:MM) | NULLABLE | Trip start time (24-hour format) |
| `closing_time` | STRING (HH:MM) | NULLABLE | Trip end time (24-hour format) |
| `total_hours` | DECIMAL(10,2) | NULLABLE | Auto-calculated trip duration |
| **Distance Information** |
| `starting_kms` | DECIMAL(10,2) | NULLABLE | Odometer reading at start |
| `closing_kms` | DECIMAL(10,2) | NULLABLE | Odometer reading at end |
| `total_kms` | DECIMAL(10,2) | NULLABLE | Auto-calculated distance traveled |
| `chargeable_kms` | DECIMAL(10,2) | NULLABLE | Billable KMs (total - free) |
| `free_kms` | DECIMAL(10,2) | NULLABLE | Free kilometers allowed |
| **Charge Rates** |
| `charge_per_km` | DECIMAL(10,2) | NULLABLE | Per-kilometer charge rate |
| `charge_per_hour` | DECIMAL(10,2) | NULLABLE | Per-hour charge rate |
| `charge_per_day` | DECIMAL(10,2) | NULLABLE | Per-day charge rate (multi-day trips) |
| **Additional Charges** |
| `toll_charges` | DECIMAL(10,2) | NULLABLE | Toll/highway fees |
| `night_halt_charges` | DECIMAL(10,2) | NULLABLE | Overnight halt charges |
| `driver_bata` | DECIMAL(10,2) | NULLABLE | Driver daily allowance |
| `permit_charges` | DECIMAL(10,2) | NULLABLE | Permit/documentation fees |
| `other_expenses` | DECIMAL(10,2) | NULLABLE | Miscellaneous expenses |
| **Total & Payment** |
| `total_amount` | DECIMAL(12,2) | NOT NULL | Grand total of all charges |
| `advance` | DECIMAL(12,2) | NULLABLE | Advance payment received |
| `payable_amount` | DECIMAL(12,2) | NULLABLE | Outstanding amount (total - advance) |
| `rupees_in_words` | STRING | NULLABLE | Total amount in English words (for invoice) |
| **Audit** |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | Bill creation timestamp |
| `updated_at` | TIMESTAMP | AUTO_UPDATE | Last modification timestamp |

**Calculation Logic:**
- `total_kms = closing_kms - starting_kms`
- `chargeable_kms = MAX(0, total_kms - free_kms)`
- `total_hours = calculateTotalHours(starting_time, closing_time, multipleDays, tripDate, tripEndDate)`
- `total_amount = (chargePerKm × chargeableKms) + (chargePerHour × totalHours) + (chargePerDay × dayCount) + tollCharges + nightHaltCharges + driverBata + permitCharges + otherExpenses`
- `payableAmount = total_amount - advance`

---

### Customer Model (customers table)

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique customer ID |
| `name` | STRING | UNIQUE, NOT NULL | Customer name (for autocomplete) |
| `gstin` | STRING | NULLABLE | GST number (pre-filled on bill) |
| `created_at` | TIMESTAMP | DEFAULT: NOW() | Record creation time |
| `updated_at` | TIMESTAMP | AUTO_UPDATE | Last update time |

**Purpose:** Provides autocomplete suggestions for customer names when creating new bills.

---

## 🔐 Login Credentials

### Default System Users

| Username | Password | Name | Role | Created By |
|----------|----------|------|------|-----------|
| `sureshkumarn` | `admin123` | Suresh Kumar N | admin | seed.js default |
| `barath` | `admin123` | Barath | admin | seed.js default |

**Security Notes:**
- All passwords are hashed with bcryptjs (salt rounds: 10)
- Login returns a JWT token valid for 7 days (configurable via `JWT_EXPIRES_IN`)
- All API requests require the token in `Authorization: Bearer <token>` header
- Expired or invalid tokens trigger automatic logout and redirect to login page

**How to Add New Users:**
1. Access PostgreSQL database directly (Supabase dashboard or psql CLI)
2. Insert into `users` table:
   ```sql
   INSERT INTO users (username, name, password_hash, role) 
   VALUES ('newuser', 'New User', '<bcrypt_hash>', 'admin');
   ```
3. Or add to `backend/prisma/seed.js` and run `npm run prisma:seed`

---

## 📡 API Endpoints

**Base URL:** `https://your-backend-url/api` (or `/api` for local dev)  
**Authentication:** All endpoints (except login) require `Authorization: Bearer <jwt_token>` header

### Authentication Endpoints

#### `POST /auth/login`
**Purpose:** User login  
**Public:** Yes

**Request:**
```json
{
  "username": "sureshkumarn",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Suresh Kumar N",
    "username": "sureshkumarn",
    "role": "admin"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials."
}
```

---

#### `GET /auth/profile`
**Purpose:** Fetch current user profile  
**Authentication:** ✅ Required

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "Suresh Kumar N",
    "username": "sureshkumarn",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### `PUT /auth/update-password`
**Purpose:** Change user password  
**Authentication:** ✅ Required

**Request:**
```json
{
  "currentPassword": "admin123",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password updated successfully."
}
```

**Validation Rules:**
- Current password must be correct
- New password must be at least 6 characters

---

### Bill Management Endpoints

#### `POST /bills/create`
**Purpose:** Create a new bill  
**Authentication:** ✅ Required

**Request:**
```json
{
  "customerName": "ABC Exports Ltd",
  "travelDetails": "Mumbai to Pune",
  "gstin": "27AABCT1234H1Z5",
  "date": "2026-04-19",
  "vehicleNumber": "MH02AB1234",
  "multipleDays": false,
  "tripDate": "2026-04-19",
  "tripEndDate": null,
  "startingTime": "08:00",
  "closingTime": "18:30",
  "startingKms": 45000,
  "closingKms": 45280,
  "chargePerKm": 15.50,
  "chargePerHour": 100,
  "freeKms": 0,
  "chargePerDay": 1200,
  "tollCharges": 250,
  "nightHaltCharges": 0,
  "driverBata": 500,
  "permitCharges": 0,
  "otherExpenses": 100,
  "advance": 2000
}
```

**Response (201 Created):**
```json
{
  "message": "Bill created successfully.",
  "bill": {
    "id": 145,
    "billNumber": "26-145",
    "customerName": "ABC Exports Ltd",
    "totalAmount": 12345.50,
    "payableAmount": 10345.50,
    "createdAt": "2026-04-19T12:30:45Z"
  }
}
```

**Auto-Calculations Done:**
- `totalKms = closingKms - startingKms`
- `totalHours = calculateTotalHours(startingTime, closingTime)`
- `chargeableKms = totalKms - freeKms`
- `totalAmount = (chargePerKm × chargeableKms) + (chargePerHour × totalHours) + tollCharges + driverBata + otherExpenses + ...`
- `rupeesInWords = numberToWords(totalAmount)` (e.g., "Twelve Thousand Three Hundred Forty Five Rupees and Fifty Paise Only")

---

#### `GET /bills`
**Purpose:** List all bills with pagination  
**Authentication:** ✅ Required

**Query Parameters:**
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 20): Bills per page

**Example:** `/bills?page=1&limit=20`

**Response (200 OK):**
```json
{
  "bills": [
    {
      "id": 145,
      "billNumber": "26-145",
      "customerName": "ABC Exports Ltd",
      "date": "2026-04-19",
      "totalAmount": 12345.50,
      "payableAmount": 10345.50,
      "createdAt": "2026-04-19T12:30:45Z"
    }
  ],
  "pagination": {
    "total": 256,
    "page": 1,
    "limit": 20,
    "totalPages": 13
  }
}
```

---

#### `GET /bills/:billNumber`
**Purpose:** Fetch a single bill by bill number  
**Authentication:** ✅ Required

**Example:** `/bills/26-145`

**Response (200 OK):**
```json
{
  "bill": {
    "id": 145,
    "billNumber": "26-145",
    "customerName": "ABC Exports Ltd",
    "travelDetails": "Mumbai to Pune",
    "gstin": "27AABCT1234H1Z5",
    "date": "2026-04-19T12:30:45Z",
    "vehicleNumber": "MH02AB1234",
    "totalKms": 280,
    "totalAmount": 12345.50,
    "payableAmount": 10345.50,
    "advance": 2000,
    "rupeesInWords": "Twelve Thousand Three Hundred Forty Five Rupees and Fifty Paise Only"
  }
}
```

---

#### `PUT /bills/update/:billNumber`
**Purpose:** Update an existing bill  
**Authentication:** ✅ Required

**Example:** `/bills/update/26-145`

**Request:** (same fields as create, all optional)
```json
{
  "customerName": "ABC Exports Ltd",
  "advance": 3000,
  "chargePerKm": 16.00
}
```

**Response (200 OK):**
```json
{
  "message": "Bill updated successfully.",
  "bill": { /* updated bill object */ }
}
```

---

#### `DELETE /bills/:billNumber`
**Purpose:** Delete a bill  
**Authentication:** ✅ Required

**Example:** `/bills/26-145`

**Response (200 OK):**
```json
{
  "message": "Bill deleted successfully."
}
```

---

#### `GET /bills/search?q={query}`
**Purpose:** Text search bills by bill number, customer name, vehicle number  
**Authentication:** ✅ Required

**Example:** `/bills/search?q=ABC`

**Response (200 OK):**
```json
{
  "bills": [
    { /* matching bill objects */ }
  ]
}
```

**Search Query Matches:**
- Bill number: `26-145` matches "145" or "26-"
- Customer name: case-insensitive substring match
- Vehicle number: case-insensitive substring match

---

#### `GET /bills/filter`
**Purpose:** Advanced filtering by date range, customer, bill number range  
**Authentication:** ✅ Required

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD format
- `endDate` (optional): YYYY-MM-DD format
- `customerName` (optional): exact match
- `billNumberFrom` (optional): lowest bill number (numeric part)
- `billNumberTo` (optional): highest bill number (numeric part)

**Example:** `/bills/filter?startDate=2026-01-01&endDate=2026-04-30&customerName=ABC`

**Response (200 OK):**
```json
{
  "bills": [ /* filtered bill objects */ ]
}
```

---

#### `GET /bills/dashboard`
**Purpose:** Dashboard statistics  
**Authentication:** ✅ Required

**Response (200 OK):**
```json
{
  "stats": {
    "totalBills": 256,
    "monthlyRevenue": 125456.75,
    "recentTrips": [
      {
        "id": 145,
        "billNumber": "26-145",
        "customerName": "ABC Exports Ltd",
        "totalAmount": 12345.50,
        "createdAt": "2026-04-19T12:30:45Z"
      }
    ]
  }
}
```

---

#### `GET /bills/customers`
**Purpose:** Autocomplete customer names  
**Authentication:** ✅ Required

**Response (200 OK):**
```json
{
  "customers": [
    { "id": 1, "name": "ABC Exports Ltd", "gstin": "27AABCT1234H1Z5" },
    { "id": 2, "name": "XYZ Trading", "gstin": null }
  ]
}
```

---

#### `GET /bills/:billNumber/pdf`
**Purpose:** Download invoice as PDF  
**Authentication:** ✅ Required

**Example:** `/bills/26-145/pdf`

**Response (200 OK):**
- Content-Type: `application/pdf`
- Returns binary PDF file (Puppeteer-generated)

**PDF Generation Process (3-Tier Fallback):**
1. **Tier 1 (Backend - Puppeteer):** Server renders HTML invoice to PDF using Puppeteer
2. **Tier 2 (Frontend - html2pdf.js):** If Tier 1 fails, client-side fallback using html2pdf.js
3. **Tier 3 (Browser Print):** If Tier 2 fails, opens browser print dialog for "Save as PDF"

---

#### `GET /bills/:billNumber/invoice`
**Purpose:** Get invoice HTML (for inline preview or pdf generation)  
**Authentication:** ✅ Required

**Example:** `/bills/26-145/invoice`

**Response (200 OK):**
- Content-Type: `text/html`
- Returns complete invoice HTML with inline CSS styling

---

## 🔄 Data Flow & Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ USER INTERACTION                                                │
└─────────────────────────────────────────────────────────────────┘

1. User enters username & password on Login.jsx page

2. Frontend → /api/auth/login (POST)
   - axios sends credentials
   - Backend validates against bcrypt hash in DB

3. Backend Response:
   {
     token: "JWT_TOKEN",
     user: { id, name, username, role }
   }

4. Frontend stores in localStorage:
   - localStorage.setItem("token", JWT_TOKEN)
   - localStorage.setItem("user", JSON.stringify(user))

5. Axios Interceptor adds token to all subsequent requests:
   headers.Authorization = "Bearer JWT_TOKEN"

6. ProtectedRoute Component checks localStorage.token
   - If exists: render page + Navbar
   - If missing: redirect to /login

7. Token expires after 7 days (configurable)
   - Backend returns 401 on expired token
   - Interceptor catches 401 → clears localStorage → redirect to /login

┌─────────────────────────────────────────────────────────────────┐
```

---

### Bill Creation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ CREATE BILL FLOW                                                 │
└──────────────────────────────────────────────────────────────────┘

1. User clicks "Create Bill" → CreateBill.jsx page loads
   - BillForm component renders with empty fields

2. User fills form with trip details:
   - Customer info, distances, times, charges, advance

3. User clicks "Create" button
   - React Hook Form validates input
   - Trigger billAPI.create(formData) via Axios

4. Frontend → POST /api/bills/create

5. Backend (billController.createBill):
   a) Validate input (customerName required)
   b) Generate bill number: billNumberService.generateBillNumber()
      - Fetches last bill number for current year (YY format)
      - Increments counter: YY-001, YY-002, ... YY-999
   c) Calculate auto-filled fields:
      - totalKms = closingKms - startingKms
      - totalHours = calculateTotalHours(startTime, endTime)
      - chargeableKms = totalKms - freeKms
      - totalAmount = sum of all charges
      - payableAmount = totalAmount - advance
      - rupeesInWords = numberToWords(totalAmount)
   d) Create bill in database:
      - INSERT INTO bills (all fields)
   e) Auto-populate customer name in customers table for future autocomplete

6. Backend Response: 201 Created
   {
     message: "Bill created successfully.",
     bill: { billNumber: "26-001", totalAmount: 12345.50, ... }
   }

7. Frontend receives response
   - Toast notification: "Bill created!"
   - Redirect to ViewBill page to show newly created invoice
   - User can now download PDF, print, or share

┌──────────────────────────────────────────────────────────────────┐
```

---

### PDF Generation Flow (3-Tier Fallback)

```
┌──────────────────────────────────────────────────────────────────┐
│ PDF DOWNLOAD FLOW                                                │
└──────────────────────────────────────────────────────────────────┘

User clicks "Download PDF" on ViewBill page
      ↓
handleDownloadPDF() executes
      ↓
╔══════════════════════════════════════════════════════════════════╗
║ TIER 1: Backend PDF Generation (Puppeteer)                      ║
╚══════════════════════════════════════════════════════════════════╝

1. Frontend calls: billAPI.getPDF(billNumber)
   POST /api/bills/{billNumber}/pdf

2. Backend executes: generateBillPDF()
   a) Fetch bill from database
   b) Call generateInvoiceHTML(bill) from pdfService.js
      - Creates complete HTML invoice with inline CSS
      - Includes header, customer details, charges table, footer
      - All styling embedded (no external stylesheets)
   c) Launch Puppeteer with args: --no-sandbox, --disable-setuid-sandbox
   d) Set viewport: 794×1123px (A4 dimensions at 96 DPI)
   e) Inject optimized print CSS into HTML
   f) Set page content with waitUntil: ['domcontentloaded', 'networkidle0']
   g) Wait 1000ms for layout stabilization
   h) Generate PDF:
      - format: 'A4'
      - margin: 0 (full page)
      - scale: 1
      - printBackground: true
      - preferCSSPageSize: true
   i) Return PDF as Buffer
   j) Frontend receives PDF blob

3. Frontend downloads PDF
   → SUCCESS: Bill downloaded as PDF file
   → Next step: User opens PDF in browser/app

      ↓ [IF TIER 1 FAILS]
      
╔══════════════════════════════════════════════════════════════════╗
║ TIER 2: Frontend html2pdf.js Fallback                           ║
╚══════════════════════════════════════════════════════════════════╝

1. Catch block from Tier 1 error
2. Call createPdfBlobFromInvoiceHtml()
   a) Reference the already-rendered invoice HTML in iframe
   b) Use html2pdf library:
      - scale: 3 (high quality)
      - allowTaint: true (allow cross-origin images)
      - logging: true
   c) Generate PDF blob on client-side
3. Download the blob
   → SUCCESS: Bill downloaded via client-side PDF generation
   → Fallback successful

      ↓ [IF TIER 2 ALSO FAILS]

╔══════════════════════════════════════════════════════════════════╗
║ TIER 3: Browser Print Dialog (Ultimate Fallback)                ║
╚══════════════════════════════════════════════════════════════════╝

1. Catch block from Tier 2 error
2. Get reference to iframe containing invoice
3. Open browser print dialog:
   - iframe.contentWindow.print()
4. User manually selects:
   - Print destination: "Save as PDF"
   - File name: "invoice-26-145.pdf"
5. Browser saves PDF
   → SUCCESS: Bill saved via browser print dialog
   → Guaranteed to always work

┌──────────────────────────────────────────────────────────────────┐
```

---

### Search & Filter Flow

```
┌──────────────────────────────────────────────────────────────────┐
│ SEARCH FLOW                                                      │
└──────────────────────────────────────────────────────────────────┘

User enters search term on SearchBills page → types "26-" or "ABC"
      ↓
billAPI.search(query)
      ↓
Backend: GET /bills/search?q=26-
      ↓
Database query:
   SELECT * FROM bills
   WHERE bill_number ILIKE '%26-%'
      OR customer_name ILIKE '%26-%'
      OR vehicle_number ILIKE '%26-%'
   ORDER BY created_at DESC
      ↓
Return matching bills array
      ↓
Frontend renders BillTable with results
      ↓
User clicks on row → Navigate to ViewBill page

┌──────────────────────────────────────────────────────────────────┐
│ FILTER FLOW                                                      │
└──────────────────────────────────────────────────────────────────┘

User selects date range, customer name, bill number range
      ↓
billAPI.filter({
  startDate: "2026-01-01",
  endDate: "2026-04-30",
  customerName: "ABC",
  billNumberFrom: 100,
  billNumberTo: 200
})
      ↓
Backend: GET /bills/filter?startDate=2026-01-01&endDate=2026-04-30&...
      ↓
Database query with WHERE clause:
   SELECT * FROM bills
   WHERE date >= startDate
     AND date <= endDate
     AND customer_name = customerName (if provided)
     AND bill_number >= 'YY-100' (if provided)
     AND bill_number <= 'YY-200' (if provided)
   ORDER BY created_at DESC
      ↓
Return filtered results
      ↓
Frontend renders results in BillTable component

┌──────────────────────────────────────────────────────────────────┐
```

---

## 🎨 Frontend Components

### Page Components

#### **Login.jsx**
- **Purpose:** User authentication
- **Route:** `/login` (public, no auth required)
- **Features:**
  - Username & password input fields
  - Login button with loading state
  - Error message display
  - Redirect to dashboard on success
- **State:** Manages form data, loading status, error messages
- **API:** Calls `authAPI.login(credentials)`

#### **Dashboard.jsx**
- **Purpose:** Main landing page after login
- **Route:** `/dashboard` (protected)
- **Features:**
  - Total bills count
  - Monthly revenue statistics
  - Recent bills list (last 10)
  - Quick action buttons (Create Bill, Search, etc.)
- **Components Used:** Navbar, BillTable
- **API:** Calls `billAPI.getDashboard()`

#### **CreateBill.jsx**
- **Purpose:** Create new invoice
- **Route:** `/create-bill` (protected)
- **Features:**
  - BillForm component for data entry
  - Auto-generated bill number (read-only)
  - Customer name autocomplete
  - Auto-calculation of totals
  - Submit handler
- **Components Used:** BillForm
- **API:** Calls `billAPI.create(formData)`

#### **SearchBills.jsx**
- **Purpose:** Find bills by multiple criteria
- **Route:** `/search-bills` (protected)
- **Features:**
  - Text search box (real-time search)
  - Filter panel:
    - Date range picker
    - Customer name input
    - Bill number range
  - Results table with pagination
  - Click row to view bill
- **Components Used:** BillTable (search results table)
- **APIs:**
  - `billAPI.search(query)` for text search
  - `billAPI.filter(params)` for advanced filtering

#### **ViewBill.jsx**
- **Purpose:** Display invoice details with PDF options
- **Route:** `/view-bill/:billNumber` (protected)
- **Features:**
  - Full invoice display in styled container
  - PDF download (3-tier fallback)
  - Print button (browser native)
  - Share button (Web Share API or fallback)
  - Edit button (redirect to EditBill)
  - Invoice HTML rendered in iframe
- **State:**
  - Bill data (fetched from API)
  - PDF download status
  - Error handling for all tiers
- **APIs:**
  - `billAPI.getByNumber(billNumber)` to fetch bill data
  - `billAPI.getInvoiceHtml(billNumber)` to get HTML
  - `billAPI.getPDF(billNumber)` to download PDF
- **PDF Features:** 3-tier fallback, progress toast, debug console logs

#### **EditBill.jsx**
- **Purpose:** Modify existing invoice
- **Route:** `/edit-bill/:billNumber` (protected)
- **Features:**
  - Pre-populated BillForm with current bill data
  - Same validation as CreateBill
  - Auto-recalculation on field changes
  - Submit handler calls update API
- **Components Used:** BillForm
- **APIs:**
  - `billAPI.getByNumber(billNumber)` to fetch current bill
  - `billAPI.update(billNumber, data)` to save changes

#### **ChangePassword.jsx**
- **Purpose:** Update user password
- **Route:** `/change-password` (protected)
- **Features:**
  - Current password input (validated)
  - New password input (min 6 chars)
  - Confirm password field
  - Submit button
  - Error/success feedback
- **API:** Calls `authAPI.updatePassword(data)`

---

### Reusable Components

#### **Navbar.jsx**
- **Purpose:** Top navigation bar
- **Features:**
  - Logo/app title
  - Navigation links:
    - Dashboard
    - Create Bill
    - Search Bills
  - User menu dropdown:
    - Profile info
    - Change Password link
    - Logout button
  - Responsive mobile menu
- **State:** Manages dropdown open/close
- **Props:** None (reads from localStorage)

#### **BillForm.jsx**
- **Purpose:** Shared form for create/edit operations
- **Props:**
  - `initialData` (optional, for edit mode)
  - `onSubmit` (function called on form submit)
  - `customers` (array of customer names for autocomplete)
- **Features:**
  - React Hook Form for efficient form management
  - Field groups:
    - Customer Information
    - Invoice Details
    - Trip Timing
    - Distance Information
    - Charges
    - Payment
  - Real-time auto-calculation display
  - Validation messages
  - Submit button with loading state
  - Customer name autocomplete (calls API)
- **Validation:**
  - Customer name required
  - Numeric fields must be valid numbers
  - Times in HH:MM format
- **Auto-Calculations:**
  - Total KMs
  - Total Hours
  - Chargeable KMs
  - Total Amount
  - Payable Amount
  - Rupees in Words

#### **BillTable.jsx**
- **Purpose:** Display list of bills in table format
- **Props:**
  - `bills` (array of bill objects)
  - `pagination` (page info)
  - `onPageChange` (function)
  - `isLoading` (boolean)
- **Features:**
  - Sortable columns (by Bill #, Customer, Date, Amount)
  - Pagination controls
  - Loading skeleton
  - Click row to view bill
  - Responsive mobile layout
  - Empty state message
- **Columns:**
  - Bill Number
  - Customer Name
  - Date
  - Total Amount
  - Payable Amount
  - Actions (View, Edit, Delete)

---

## ⚙️ Backend Services

### billNumberService.js
**Purpose:** Auto-generate bill numbers in `YY-XXX` format

**Functions:**
- `generateBillNumber()` → Async function
  - Gets current year (2-digit)
  - Queries DB for latest bill number matching YY format
  - Increments counter: `26-001`, `26-002`, ... `26-999`
  - Resets annually (e.g., 2027 starts with `27-001`)

---

### pdfService.js
**Purpose:** Generate professional invoice HTML template

**Functions:**
- `generateInvoiceHTML(bill)` → Returns HTML string
  - Creates complete invoice layout with all styling inline
  - Handles calculations and formatting
  - Sections:
    - Header: Company name, address, phone
    - Customer: Name, M/s title, GSTIN
    - Invoice info: Bill number, date, vehicle
    - Trip details: Trip dates, times, kilometers
    - Charges table: All charges with Rs/Ps columns
    - Total & Payment: Grand total, advance, payable
    - Footer: Bank details, signature area
  - CSS included inline for PDF rendering reliability

- `numberToWords(amount)` → Converts number to English words
  - Example: `12345.50` → "Twelve Thousand Three Hundred Forty Five Rupees and Fifty Paise Only"
  - Handles Crore, Lakh, Thousand, Hundred
  - Supports rupees and paise

- `generatePDF(bill)` → Old implementation (kept for reference, not used)

---

### pdfkitService.js
**Purpose:** Render HTML invoice to PDF using Puppeteer

**Functions:**
- `generatePDFFromHTML(bill)` → Async, returns Buffer
  - Launches Puppeteer browser in headless mode
  - Args: `--no-sandbox`, `--disable-setuid-sandbox`, `--disable-gpu` (for Render compatibility)
  - Sets viewport: 794×1123px (A4 at 96 DPI), deviceScaleFactor: 1
  - Injects optimized print CSS
  - Sets page content with network idle detection
  - Waits 1000ms for layout stabilization
  - Generates PDF with:
    - Format: A4 portrait
    - Margin: 0 (full page)
    - Scale: 1
    - Print background: true
    - CSS page sizing: true
  - Returns PDF as Buffer
  - Proper error handling and browser cleanup

---

### calculations.js (Backend & Frontend)
**Purpose:** Shared calculation utilities

**Functions:**
- `calculateTotalKms(starting, closing)` → Number
- `calculateChargeableKms(totalKms, freeKms)` → Number (max 0)
- `calculateTotalHours(startTime, endTime, multipleDays, tripDate, tripEndDate)` → Number
- `calculateDayCount(multipleDays, tripDate, tripEndDate)` → Number
- `calculateTotalAmount(billData)` → Number
  - Sums: (chargePerKm × chargeableKms) + (chargePerHour × totalHours) + (chargePerDay × dayCount) + tollCharges + nightHaltCharges + driverBata + permitCharges + otherExpenses
- `calculatePayableAmount(totalAmount, advance)` → Number

---

### authMiddleware.js
**Purpose:** Verify JWT tokens on protected routes

**Functionality:**
- Extracts token from `Authorization: Bearer TOKEN` header
- Verifies token signature using `JWT_SECRET`
- Decodes token to get user info (id, username, role)
- Attaches user object to `req.user`
- Returns 401 Unauthorized if token missing/invalid/expired

---

## 🚀 Setup & Deployment

### Local Development Setup

#### Backend

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cat > .env << EOF
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/slc_billing
DIRECT_URL=postgresql://user:password@localhost:5432/slc_billing
JWT_SECRET=your-secret-key-change-me
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
EOF

# 4. Setup database (create tables)
npx prisma migrate deploy

# 5. Seed default users
npm run prisma:seed

# 6. Start development server
npm run dev
# Server runs on http://localhost:5000
```

#### Frontend

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file (for local dev, leave API URL empty)
cat > .env.local << EOF
VITE_API_URL=
EOF

# 4. Start development server
npm run dev
# App runs on http://localhost:5173
```

#### Browser

Navigate to `http://localhost:5173` and login with:
- Username: `sureshkumarn` / Password: `admin123`
- Username: `barath` / Password: `admin123`

---

### Production Deployment

#### Deploy Frontend to Vercel

```bash
# 1. Push code to GitHub
git add -A
git commit -m "your commit message"
git push origin main

# 2. Go to vercel.com → Import project
# 3. Vercel auto-detects Vite + React
# 4. Set environment variables:
#    VITE_API_URL=https://your-backend-url

# 5. Click Deploy
# Frontend auto-deploys on every push to main branch
```

#### Deploy Backend to Render

```bash
# 1. Create render.yaml in backend root (already included)

# 2. Go to render.com → New service
#    - Connect GitHub repository
#    - Select backend directory as Root Directory
#    - Runtime: Node (v18+)
#    - Build command: npm install && npx prisma migrate deploy
#    - Start command: npm start

# 3. Set environment variables in Render dashboard:
#    - DATABASE_URL (from Supabase)
#    - DIRECT_URL (from Supabase)
#    - JWT_SECRET (strong random string)
#    - JWT_EXPIRES_IN (7d)
#    - CORS_ORIGIN (https://your-frontend-domain)
#    - KEEP_ALIVE_ENABLED=true (to keep free tier alive)

# 4. Deploy
# Backend auto-deploys on every push to main branch
```

#### Setup Database (Supabase)

```bash
# 1. Go to supabase.com → Create new project
# 2. Copy connection strings:
#    - Pooled connection: DATABASE_URL
#    - Direct connection: DIRECT_URL
# 3. Run migrations:
#    npx prisma migrate deploy --skip-generate
# 4. Seed default users:
#    node prisma/seed.js
```

---

## 🔧 Environment Variables

### Backend (.env)

| Variable | Example | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Express server port |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?schema=public` | Prisma pooled connection (use pgbouncer for Supabase) |
| `DIRECT_URL` | `postgresql://user:pass@host:5432/db` | Direct DB connection (for migrations) |
| `JWT_SECRET` | `your-super-secret-key-min-32-chars` | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | `7d` | Token expiration (e.g., "7d", "24h") |
| `CORS_ORIGIN` | `https://yourdomain.com,http://localhost:5173` | Allowed frontend origins (comma-separated) |
| `KEEP_ALIVE_ENABLED` | `true` | Enable keep-alive pings (for Render free tier) |
| `KEEP_ALIVE_INTERVAL_HOURS` | `1` | Hours between keep-alive pings |
| `PUPPETEER_CACHE_DIR` | `/app/.cache/puppeteer` | Chrome browser cache location (Render specific) |
| `RENDER` | `true` | Flag to enable Render-specific configurations |

---

### Frontend (.env.local)

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://api.yourdomain.com` | Backend API base URL (empty for local dev with proxy) |

---

## ✨ Features Breakdown

### 1. **Authentication & Security**
- JWT-based token authentication
- Bcryptjs password hashing (10 rounds)
- Role-based access control (currently all "admin")
- 7-day token expiry with refresh option
- Automatic logout on 401 Unauthorized
- Secure password change with current password verification

### 2. **Bill Management**
- Auto-generated bill numbers (YY-XXX format)
- Annual counter reset (2026 → 26-001 to 26-999)
- Full CRUD operations (Create, Read, Update, Delete)
- Real-time calculation of totals and charges
- Support for multi-day trips
- Advance payment tracking with payable amount
- Rupees-in-words conversion for invoices

### 3. **Search & Filtering**
- Text search across bill number, customer, vehicle
- Case-insensitive substring matching
- Advanced filter by:
  - Date range (from/to)
  - Customer name (exact)
  - Bill number range
- Pagination support (default 20 per page)

### 4. **Invoice Management**
- Professional PDF invoices (Puppeteer-generated)
- 3-tier fallback: Backend → Frontend → Browser Print
- HTML invoice preview in iframe
- Print functionality (browser native)
- Web Share API for sharing (with fallback)
- Exact format matching ViewBill display

### 5. **Customer Management**
- Auto-populated customer database
- Customer name autocomplete on bill creation
- GSTIN tracking per customer
- Quick access to customer history

### 6. **Dashboard & Analytics**
- Total bills count
- Monthly revenue calculation
- Recent bills display
- Quick statistics snapshot
- Navigation to all major features

### 7. **Responsive Design**
- Mobile-first Tailwind CSS
- Fully responsive form inputs
- Mobile-friendly table view
- Adaptive navigation menus
- Touch-optimized buttons

### 8. **Error Handling**
- Input validation on all forms
- Database constraint validation
- API error responses with user-friendly messages
- 401 auto-redirect for expired tokens
- Toast notifications for user feedback
- Console logging for debugging

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** "Could not find Chrome" error on Render deployment
**Solution:** The backend startup script (`scripts/ensureChrome.js`) is already configured to install Chrome. Ensure `npm start` is the start command in Render settings.

**Issue:** Login not working with correct credentials
**Solution:** Verify the `users` table has been seeded. Run `npm run prisma:seed` in backend.

**Issue:** PDF download fails silently
**Solution:** Check browser console for errors. PDF generation has 3-tier fallback, so try:
1. Reload page and retry PDF download
2. Check backend logs for Puppeteer errors
3. Fall back to browser print dialog (always works)

**Issue:** "CORS error" when frontend calls backend
**Solution:** Verify `CORS_ORIGIN` environment variable matches frontend URL. Add comma-separated origins if multiple.

**Issue:** Database connection timeout
**Solution:**
- On Supabase: Increase pgbouncer pool size or use direct connection
- On self-hosted: Check firewall and network connectivity
- Verify DATABASE_URL is correct format

---

## 📝 Notes for Developers

### Code Conventions

- **Frontend:** React hooks, functional components, component per file
- **Backend:** Express middleware chain, async/await for async operations
- **Database:** Prisma ORM with type safety, snake_case column names
- **Calculations:** Shared utils folder (frontend & backend)
- **CSS:** Tailwind utility classes (no custom CSS unless necessary)

### Key Design Decisions

1. **Puppeteer for PDF:** Server-side generation ensures consistency and reliability. Client-side fallback provides redundancy.

2. **JWT over Sessions:** Stateless authentication allows horizontal scaling and is better suited for serverless platforms.

3. **Prisma ORM:** Provides type safety, automatic migrations, and optimized queries. Replaces raw SQL.

4. **Render + Vercel:** Zero-config deployment with auto-CI/CD from GitHub. Render free tier suitable for low-traffic production use.

5. **Trailing Precision:** Decimals stored as DECIMAL(12,2) to avoid floating-point errors in financial calculations.

---

## 📞 Contact & Maintenance

**Last Updated:** 19 April 2026  
**Maintained By:** Development Team  
**Next Review Date:** 30 May 2026

For deployment issues, feature requests, or bug reports, contact the development team or refer to the [README.md](README.md) for quick start guidelines.

---

**END OF DOCUMENTATION**
