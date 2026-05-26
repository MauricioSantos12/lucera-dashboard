# Lucera — Pediatric Telemedicine Dashboard

Lucera is a web-based administration dashboard for a pediatric telemedicine platform operating in Panama. It enables guardians (parents/tutors) to access AI-powered triage via WhatsApp, while administrators and physicians monitor sessions, manage patients, and track payments in real time.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Bundler | Vite 5 (SWC) |
| UI Library | Chakra UI v2 + Emotion |
| Animations | Framer Motion |
| Routing | React Router v6 |
| State | TanStack React Query v5 |
| Charts | Recharts |
| Icons | Lucide React |
| Excel Export | SheetJS (xlsx) |
| Testing | Vitest + Testing Library |
| Linting | ESLint 9 + TypeScript ESLint |

## Project Structure

```
src/
├── assets/              # Brand logos
├── components/
│   ├── layout/          # AppSidebar, DashboardLayout
│   ├── ConfirmDialog    # Reusable delete confirmation
│   ├── MotionPage       # Page transition wrapper
│   ├── MultiSelect      # Multi-option selector with search
│   ├── Pagination       # Reusable table pagination
│   ├── ProtectedRoute   # Auth guard
│   ├── StatCard         # Card wrapper for stats/tables
│   └── TriageBadge      # Triage level indicator
├── lib/
│   ├── auth.tsx         # Auth context (4 demo roles)
│   ├── exportToExcel.ts # Excel export utility
│   ├── mockData.ts      # Simulated data (patients, doctors, payments, etc.)
│   ├── theme.ts         # Chakra UI custom theme
│   └── toast.ts         # Toast notification utility
├── pages/
│   ├── Dashboard        # Home / welcome screen
│   ├── Statistics       # KPIs and charts (role-aware)
│   ├── Guardians        # CRUD for guardians (tutors)
│   ├── Children         # CRUD for pediatric patients
│   ├── Specialists      # CRUD for physicians
│   ├── Centers          # Healthcare centers directory
│   ├── Chats            # WhatsApp session monitoring
│   ├── Medications      # Medication catalog management
│   ├── Payments         # Transaction tracking + Excel export
│   ├── Profile          # User profile editing
│   ├── Schedule         # Physician availability calendar
│   ├── MyChildren       # Guardian: manage children
│   ├── MyAppointments   # Guardian: consultation history
│   ├── MySubscription   # Guardian: plan & payment history
│   ├── Login            # MFA login with role selection
│   └── NotFound         # 404 page
├── App.tsx              # Route definitions + role guards
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Roles & Access Control

| Role | Access |
|------|--------|
| Admin | Full access to all modules |
| Médico | Schedule, chats, statistics, centers, profile |
| Acudiente | My children, my appointments, my subscription, statistics |
| Finanzas | Payments only |

## Use Cases

### Admin
- View platform-wide KPIs (active users, sessions, revenue, CSAT)
- CRUD operations on guardians, children, specialists, centers, and medications
- Monitor AI chat sessions in real time
- Track and export payment transactions to Excel
- Manage triage-recommended healthcare centers

### Physician (Médico)
- View personal clinical statistics (appointments, CSAT, referrals)
- Manage availability schedule (add/remove/toggle time slots)
- Monitor chat sessions assigned or escalated
- Select associated healthcare centers via multi-select

### Guardian (Acudiente)
- Register and manage children profiles (weight, blood type, allergies, conditions)
- View consultation history (read-only chat transcripts)
- Manage subscription plan with confirmation modal
- View payment history with start/end dates

### Finance (Finanzas)
- View payment KPIs (revenue, pending, failed)
- Filter transactions by method (Stripe/Yappy) and status
- Export filtered data to Excel

## Key Features

- **AI Triage System** — 3-level classification (General/Urgent/Emergency) with color coding
- **Role-Based Routing** — Routes protected by role with automatic redirects
- **Pagination** — Reusable component across all table views
- **Excel Export** — One-click export of filtered data
- **Multi-Select** — Searchable multi-option input for center assignment
- **Confirmation Dialogs** — All destructive actions require confirmation
- **Responsive Design** — Mobile-first with collapsible sidebar drawer
- **Page Transitions** — Smooth animations between views via Framer Motion
- **Custom Theme** — Brand colors (vino, naranja, crema, amarillo) with semantic tokens

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## Demo Accounts

| Role | Email | Notes |
|------|-------|-------|
| Admin | admin@lucera.pa | Full access |
| Médico | esanchez@lucera.pa | Clinical view |
| Acudiente | maria.mendoza@gmail.com | Parent view |
| Finanzas | finanzas@lucera.pa | Payments only |

> Enter any 6-digit code at the MFA step to proceed.

## Compliance

This platform is designed to comply with **Ley 81 de 2019** (Panama Data Protection Law). All patient data handling follows privacy-by-design principles.

## License

Private — All rights reserved.
