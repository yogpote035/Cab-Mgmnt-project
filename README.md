# Cab Management & Billing Automation ERP

A simple Git-deployable MERN project for corporate cab operations, booking email intake, trips, invoices, payments, reports, and admin management.

## Tech Stack

- Frontend: Vite React, Tailwind CSS, Redux Toolkit, React Router, Axios, React Hook Form, Zod, Framer Motion, Recharts, Lucide icons
- Backend: Node.js, Express, MongoDB/Mongoose, JWT auth, RBAC, Nodemailer, IMAP polling, PDFKit, ExcelJS, Multer, Winston, Swagger, Helmet, rate limiting

## Project Structure

```text
backend/    Express API, MongoDB models, services, routes, jobs, seed script
frontend/   Vite React admin dashboard
```

## Local Setup

1. Install Node.js 20+ and MongoDB, or use a MongoDB Atlas connection string.
2. Update environment files:
   - `backend/.env`
   - `frontend/.env`
3. Install dependencies:
   - `npm run install:all`
4. Check `backend/.env`:
   - `MONGODB_URI=mongodb://127.0.0.1:27017/cab_management_erp`
   - set strong JWT secrets
5. Seed demo users and data:
   - `npm run seed`
6. Start development servers:
   - `npm run dev`

To run only the backend:

```bash
cd backend
npm run dev
```

If MongoDB is not installed locally, set `MONGODB_URI` in `backend/.env` to your MongoDB Atlas connection string.

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:5000/api`  
Swagger: `http://localhost:5000/api/docs`

## Demo Login

- Email: `superadmin@caberp.local`
- Password: `Admin@12345`

## Simple Git Deployment

Push this repository to GitHub, GitLab, or Bitbucket. Deploy the `backend` and `frontend` as two services.

### Backend Service

Use any Node host such as Render, Railway, Cyclic, DigitalOcean App Platform, AWS Elastic Beanstalk, or a VPS.

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Required environment variables:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `MONGODB_URI=your_mongodb_atlas_uri`
  - `CLIENT_URL=https://your-frontend-domain.com`
  - `JWT_ACCESS_SECRET=strong_secret`
  - `JWT_REFRESH_SECRET=strong_secret`
  - SMTP/IMAP variables if email automation is enabled

After first deploy, run the seed command once from the host shell if needed:

```bash
npm run seed
```

### Frontend Service

Use Vercel, Netlify, Render Static Site, Cloudflare Pages, or any static hosting provider.

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable:
  - `VITE_API_URL=https://your-backend-domain.com/api`

## Included Modules

Dashboard analytics, cars, drivers, inquiries, trips, duty slips, invoices, payments, reports, admin management, profile, audit activity, email logs, Excel export, responsive dark/light SaaS UI.
