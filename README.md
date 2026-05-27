# Cab Management & Billing Automation ERP

Production-ready MERN scaffold for corporate cab operations, booking email intake, trip workflows, invoice automation, payments, and reporting.

## Stack

- Frontend: Vite React, Tailwind CSS, Redux Toolkit, React Router, Axios, React Hook Form, Zod, Framer Motion, Recharts, Lucide icons
- Backend: Node.js, Express, MongoDB/Mongoose, JWT auth, RBAC, Nodemailer, IMAP polling, PDFKit, ExcelJS, Multer, Winston, Swagger, Helmet, rate limiting

## Quick Start

1. Copy env files:
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
2. Install dependencies:
   - `npm run install:all`
3. Start MongoDB locally or run `docker compose up mongo`
4. Seed demo users and data:
   - `npm run seed`
5. Run both apps:
   - `npm run dev`

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:5000/api`  
Swagger: `http://localhost:5000/api/docs`

## Demo Login

- Email: `superadmin@caberp.local`
- Password: `Admin@12345`

## Deployment

- Set all production secrets in environment variables.
- Use a managed MongoDB cluster.
- Run backend behind HTTPS reverse proxy.
- Build frontend with `npm run build --prefix frontend` and serve `frontend/dist`.
- Configure SMTP and IMAP credentials before enabling email polling.

## Included Modules

Dashboard analytics, vehicles, drivers, inquiries, trips, duty slips, invoices, payments, reports, admin management, profile, audit activity, email logs, exports, responsive dark/light SaaS UI.
