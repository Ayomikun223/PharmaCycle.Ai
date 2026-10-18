# 🌍 PharmaCycle.AI — Nigerian Pharmaceutical Redistribution Platform

PharmaCycle.AI is a peer-to-peer (P2P) pharmaceutical exchange platform designed to reduce medicine waste, optimize pharmacy inventory management, and solve product scarcity across Nigerian healthcare facilities.

By facilitating the secure exchange and redistribution of near-expiry inventory, PharmaCycle.AI saves lives and reduces losses for local community pharmacies.

---

## ✨ Key Features

1. **📷 Google Lens-style Camera Scanner & OCR**:
   - Photograph medicine packaging directly inside the app to auto-fill details (Medicine Name, Strength, Form, Category, etc.).
   - Dual-engine parsing: Utilizes **Google Gemini AI** for advanced semantic recognition with a local **Tesseract.js** client-side fallback if network or API limits are reached.
   - **Max 5 MB file guards** prevent memory overflow on uploads.

2. **🔍 Native QR & Barcode Reader**:
   - Switch the camera viewfinder to **QR & Barcode** scan mode.
   - Leverages browser-native hardware-accelerated **BarcodeDetector API** to detect standard linear barcodes and QR codes in real-time.
   - Audio success feedback (synthesized Web Audio beep) and auto-lookup of existing batch/NAFDAC numbers in inventory.

3. **🇳🇬 NAFDAC Regulatory Compliance**:
   - Uses regional **NAFDAC Reg. No.** nomenclature instead of generic batch numbers, tailoring the validation flow to Nigerian pharmaceutical standards.

4. **💡 AI Insights & Expiry Risk Forecasting**:
   - Real-time charts showing Near-Expiry, Low-Stock, and Out-of-Stock inventory status.
   - Automated AI insights indicating demand spikes (e.g. malaria season fluctuations, dry season shifts) with color-coded positive (Green) and negative (Red) demand forecasts.

5. **💼 Demo Experience Panel**:
   - Clickable credentials block at the login screen for prefilled testing accounts representing both Pharmacies and General Consumers.

6. **📱 Adaptive Mobile Off-Canvas Sidebar**:
   - Fully responsive interface transitioning from a sleek left-aligned sidebar on desktop to a backdrop-blurred hamburger drawer layout on smaller devices.

---

## 🛠 Tech Stack

### Frontend (Next.js Application)

- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS v4 (with PostCSS compilation)
- **OCR**: Tesseract.js & Google Gemini API integrations
- **Scanning**: Browser-native `getUserMedia` + `BarcodeDetector` APIs
- **Contexts & Hooks**: Custom React Contexts for Toast & Auth states

### Backend (Node.js REST Server)

- **Runtime**: Node.js & Express
- **Database**: PostgreSQL (hosted on Neon Serverless)
- **ORM**: Prisma Client v5 (with fail-soft re-connection, connection pooling, and 503 error handling middleware)
- **Storage**: Cloudinary & Multer for image hosting
- **API Routing**: JWT Authenticated endpoints for Transfers, Listings, Auth, and Analytics

---

## 🚀 Setup & Execution

### Prerequisites

- Node.js (v18+)
- PostgreSQL instance (or Neon connection URL)

### 1. Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd pharmaexchange-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file containing:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@host/neondb?sslmode=require"
   JWT_SECRET="your-jwt-signing-secret"
   CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   GEMINI_API_KEY="your-google-gemini-key"
   GROQ_API_KEY="your-groq-api-key"
   ```
4. Run migrations and seed data:
   ```bash
   npx prisma migrate dev
   npx prisma db seed   # or: npm run seed
   ```
5. Start backend:
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd pharmaexchange-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Start Next.js client development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 💡 Monorepo Commands (From Root)

You can also run both projects directly from the workspace root:
- Install all: `npm run install:all`
- Start frontend: `npm run dev:frontend`
- Start backend: `npm run dev:backend`

---

## ▲ Deploying to Vercel

Deploy the repo as **two Vercel projects** from the same Git repository:

| Project  | Root Directory            | Framework preset |
| -------- | ------------------------- | ---------------- |
| Backend  | `pharmaexchange-backend`  | Express (auto-detected from `src/server.js`) |
| Frontend | `pharmaexchange-frontend` | Next.js          |

Deploy the backend first so you have its URL for the frontend.

### Backend environment variables

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `DATABASE_URL` | ✅ | Use Neon's **pooled** connection string (host contains `-pooler`). |
| `JWT_SECRET` | ✅ | Long random string. |
| `CLIENT_URL` | ✅ | Frontend URL(s), comma-separated, no trailing slash. |
| `CLIENT_URL_PATTERN` | optional | Regex for preview URLs, e.g. `^https://pharmacycle-.*\.vercel\.app$`. |
| `CRON_SECRET` | ✅ | Random string; Vercel Cron sends it to `/cron/expiry-check`. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | ✅ | Image uploads. |
| `GEMINI_API_KEY` | optional | Server-side OCR; the browser falls back to Tesseract without it. |
| `GROQ_API_KEY` | ✅ for AI Insights | `LLM_MODEL` optionally overrides the model. |
| `RESEND_API_KEY`, `EMAIL_FROM` | optional | `EMAIL_FROM` must be on a domain verified in Resend. |
| `JWT_EXPIRES_IN` | optional | Defaults to `7d`. |

### Frontend environment variables

| Variable | Notes |
| -------- | ----- |
| `NEXT_PUBLIC_API_URL` | Backend URL, no trailing slash. Inlined at build time, so set it for Production **and** Preview, and redeploy after changing it. |

### Database migrations

Migrations live in `pharmaexchange-backend/prisma/migrations`. Apply them to the production database from your machine:

```bash
cd pharmaexchange-backend
DATABASE_URL="<neon direct (non-pooler) url>" npx prisma migrate deploy
```

If the database was created earlier with `prisma db push` and already has the tables, mark the baseline as applied instead:

```bash
npx prisma migrate resolve --applied 0_init
```

### Scheduled jobs

Locally, `node-cron` runs the expiry check daily. On Vercel, `pharmaexchange-backend/vercel.json` registers a daily Vercel Cron (01:00 UTC) that calls `GET /cron/expiry-check` with `CRON_SECRET`. Request bodies on Vercel are capped at ~4.5 MB, so the API accepts up to 4 MB, and the scan page downscales photos before sending them.

---

## 🔒 Security & Safe Pushes

All API credentials, private keys, database connection strings, and backend secrets are strictly encapsulated in `.env` / `.env.local` files, which are ignored by Git. No sensitive configurations are present in source files, making this repository safe to push to public platforms like GitHub.
