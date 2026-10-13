# PharmaExchange Frontend

Next.js 16 (App Router) frontend application for the PharmaCycle.AI platform.

## Features

- **Google Lens-style Camera & OCR**: Dual-tier live package label scanning (Gemini AI Vision + Tesseract.js client-side fallback).
- **Barcode & QR Scanner**: Real-time barcode decoding with audio feedback and product lookup.
- **NAFDAC Compliance**: Native Nigerian NAFDAC Reg. No. and batch tracking.
- **Dashboard & Analytics**: Real-time stock status donut chart, KPIs, sparklines, and CSV report export.
- **P2P Transfer Exchange**: Available medicine listings, bidding/request flow, and transfer request fulfillment pipeline.
- **AI Insights**: Expiry risk forecasting, epidemiological seasonal forecasts, and restock suggestions.
- **Consumer Search Portal**: Public medicine availability and distance-based pharmacy locator.

## Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional, defaults to http://localhost:5000)
cp .env.example .env.local

# 3. Start development server
npm run dev
```

App runs on [http://localhost:3000](http://localhost:3000).
