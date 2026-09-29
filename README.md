# HRMS — HR Management System

A complete, professional HR Management System built with **React + Node.js/Express + MySQL**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 + React Router DOM v6 |
| Backend | Node.js 22 + Express 4 |
| Database | MySQL 8 (port 3306) |
| Auth | JWT + bcryptjs |
| Styling | CSS Modules |
| Icons | Lucide React |
| Calendar | FullCalendar v6 |
| Rich Text | React Quill |
| Logging | Winston |
| Email | Nodemailer |
| File Upload | Multer |
| PDF Export | PDFKit |
| Rate Limiting | express-rate-limit |
| Security | Helmet + CORS |

## Features (14 Modules)

1. **Dashboard** — Stats cards, department charts, recent activity, upcoming holidays, quick actions
2. **Employee Management** — Full CRUD, photo upload, bank details, emergency contacts, salary structure
3. **Department & Designation** — Hierarchical departments, designation levels
4. **Attendance** — Check-in/out, late tracking, overtime, monthly reports, FullCalendar view
5. **Leave Management** — Leave types, balances, apply/approve/reject workflow, team view
6. **Payroll** — Salary generation, payslip PDF download, payment tracking
7. **Recruitment** — Job openings, candidates, applications pipeline, interview scheduling
8. **Employee Documents** — Upload, categorize, verify documents (Aadhaar, PAN, certificates)
9. **Performance** — Reviews with self/manager ratings, goals tracking
10. **Asset Management** — Asset inventory, assign/return tracking
11. **Notices & Announcements** — Rich text notices with audience targeting
12. **Reports** — Employee, attendance, leave, payroll reports with CSV/PDF export
13. **User & Role Management** — 5 roles, granular permission matrix (module × action)
14. **Notifications** — In-app notification system with read tracking

## Architecture

- **MVC Pattern** on backend (Models → Controllers → Routes)
- **Soft Deletes** on all tables (`is_deleted` + `deleted_at`)
- **Master Tables** for lookups (gender, blood group, employment type, etc.)
- **Role-Based Access Control** with granular permissions
- **Audit Logging** for all important actions
- **Parameterized SQL queries** throughout (no SQL injection risk)

## Getting Started

### Prerequisites

- Node.js 18+ (tested with v22)
- MySQL 8 (MySQL Workbench on port 3306)
- npm 9+

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install --legacy-peer-deps
```

### 2. Configure Environment

Edit `server/.env` and set your MySQL password:

```env
DB_PASSWORD=your_mysql_root_password
```

### 3. Setup Database

```bash
cd server
node database/setup.js
```

Set `ADMIN_PASSWORD` in `server/.env` to a unique password of at least 12 characters before running setup. Do not reuse this password elsewhere.

This creates the `hrms_db` database with 30+ tables and seed data including:
- Initial super admin username: `admin` (password is the configured `ADMIN_PASSWORD`)
- 5 roles with permissions
- 8 departments, 13 designations
- Leave types, holidays, master data

### 4. Start Development

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open **http://localhost:5173** and login with:
- Username: `admin`
- Password: `Admin@123`

## Project Structure

```
NODE-HRMS/
├── server/
│   ├── config/           # Database & app configuration
│   │   ├── db.js         # MySQL connection pool
│   │   └── config.js     # Environment config
│   ├── controllers/      # Business logic (14 controllers)
│   ├── models/           # Database queries (14 models)
│   ├── routes/           # API endpoints (17 route files)
│   ├── middleware/        # Auth, upload, validation, rate limiting, audit
│   ├── utils/            # Logger, helpers, email, PDF generator
│   ├── database/
│   │   ├── schema.sql    # Complete DB schema (837 lines)
│   │   └── setup.js      # DB initialization script
│   ├── uploads/          # File uploads directory
│   ├── logs/             # Winston log files
│   ├── .env              # Environment variables
│   └── server.js         # Express entry point
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/   # Sidebar, Header, MainLayout
│   │   │   ├── common/   # DataTable, Modal, StatCard, Button, Input, etc.
│   │   │   └── auth/     # ProtectedRoute
│   │   ├── pages/        # 14 module pages (46 files)
│   │   ├── context/      # AuthContext (JWT state management)
│   │   ├── services/     # API service layer (axios)
│   │   ├── hooks/        # useAuth, useFetch
│   │   ├── utils/        # Constants, formatters
│   │   ├── styles/       # CSS variables, globals, theme
│   │   ├── App.jsx       # Route definitions
│   │   └── main.jsx      # Entry point
│   ├── vite.config.js    # Vite config with API proxy
│   └── index.html        # HTML template with Inter font
│
└── README.md
```

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/login`, `GET /api/auth/profile`, `POST /api/auth/refresh-token`, `PUT /api/auth/change-password` |
| Employees | `GET/POST /api/employees`, `GET/PUT/DELETE /api/employees/:id`, bank details, emergency contacts, salary |
| Departments | `GET/POST /api/departments`, `GET/PUT/DELETE /api/departments/:id` |
| Designations | `GET/POST /api/designations`, `GET/PUT/DELETE /api/designations/:id` |
| Attendance | `GET /api/attendance`, `POST /api/attendance/check-in`, `PUT /api/attendance/check-out/:id`, mark, bulk-mark, reports |
| Leaves | `GET/POST /api/leaves/types`, `GET /api/leaves/balances/:empId`, `POST /api/leaves/requests`, approve/reject/cancel |
| Payroll | `GET /api/payroll`, `POST /api/payroll/generate`, `GET /api/payroll/:id/payslip` (PDF download) |
| Recruitment | Jobs, candidates, applications, interviews CRUD |
| Documents | Upload, list, verify, delete |
| Performance | Reviews CRUD, goals CRUD |
| Assets | Asset CRUD, assign, return |
| Notices | CRUD + active notices feed |
| Holidays | CRUD + upcoming |
| Reports | Employee, attendance, leave, payroll, department reports + export |
| Users | User CRUD, role CRUD, permission matrix |
| Dashboard | Aggregated stats endpoint |
| Notifications | List, mark read, unread count |

## Default Roles & Permissions

| Role | Access Level |
|------|-------------|
| Super Admin | Full system access (all modules, all actions) |
| HR Admin | Employee management, attendance, leaves, payroll, recruitment, reports |
| HR Executive | Day-to-day HR operations |
| Manager | Team view, leave approvals, performance reviews |
| Employee | Self-service: profile, attendance, leave apply, payslip, notices |

## Database Tables (30+)

Master tables, core tables, and supporting tables for all 14 modules. See `server/database/schema.sql` for the complete schema.

## License

MIT
