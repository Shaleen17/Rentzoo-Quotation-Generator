# 🏗️ QuoteForge — Professional Quotation Management System

<div align="center">

![QuoteForge Banner](https://img.shields.io/badge/QuoteForge-v1.0.0-blue?style=for-the-badge&logo=lightning&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A full-stack internal business tool that generates pixel-perfect branded PDF quotations — instantly.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [API Docs](#-api-reference) • [Deployment](#-deployment)

</div>

---

## 📌 About

**QuoteForge** is a production-ready, full-stack web application built for equipment rental businesses to streamline their quotation workflow. Instead of wrestling with Word documents or spreadsheets, your team fills out a smart form — and gets a **professionally branded, print-ready PDF** in seconds.

> Built for internal business use, this project demonstrates end-to-end full-stack engineering: from a polished React UI to headless-browser PDF rendering, a RESTful API, and persistent SQLite storage — all served from a single Node.js process.

---

## ✨ Features

- 📋 **Dual Quotation Modes** — Equipment Rental & Lump-Sum project quotes
- ⚡ **Real-time Calculation** — Subtotals, GST, and final amounts update live
- 🖨️ **Pixel-perfect PDF Export** — Headless Chrome renders branded HTML templates to PDF
- 🗄️ **Quotation History** — All quotes persisted to SQLite; browse, view, and re-download any time
- 🔢 **Auto Numbering** — Sequential IDs like `RZQ-20261103-0001` with collision-safe logic
- 🧾 **Fully Editable Fields** — Scope of work, payment terms, GST toggle, T&Cs, and custom notes
- 🌐 **Single-Server Production** — Express serves the React SPA + API from one port after build
- 🔒 **Input Validation** — Server-side normalization and typed validation on all fields

---

## 🛠️ Tech Stack

| Layer            | Technology                     | Purpose                       |
| ---------------- | ------------------------------ | ----------------------------- |
| **Frontend**     | React 18 + Vite 5              | SPA with fast HMR in dev      |
| **Styling**      | Tailwind CSS 3                 | Utility-first responsive UI   |
| **Backend**      | Node.js 22 + Express 4         | REST API server               |
| **Database**     | SQLite (`better-sqlite3`)      | File-based persistent storage |
| **PDF Engine**   | Puppeteer 24 (headless Chrome) | HTML → PDF rendering          |
| **PDF Template** | Vanilla HTML/CSS               | Pixel-perfect branded layout  |
| **Dev Tooling**  | Concurrently, Nodemon          | Parallel dev server startup   |
| **Logging**      | Morgan                         | HTTP request logging          |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (React App)                   │
│         Form UI → API calls → PDF download link          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST
┌────────────────────────▼────────────────────────────────┐
│              Express Server  (port 5000)                  │
│                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  REST API   │    │   SQLite    │    │  Puppeteer  │  │
│  │  /api/*     │───▶│  Database   │    │  (Chrome)   │  │
│  └─────────────┘    └─────────────┘    └──────┬──────┘  │
│                                                │          │
│                                    ┌───────────▼──────┐  │
│                                    │  HTML Template   │  │
│                                    │  → PDF Output    │  │
│                                    └──────────────────┘  │
│                                                           │
│  [Production] Also serves client/dist as static files    │
└───────────────────────────────────────────────────────────┘
```

### Request Flow — Creating a Quotation

```
1. User fills the form in React
2. POST /api/quotations  { clientName, items, GST, terms... }
3. Server validates + normalizes all fields
4. Calculates subtotals, tax, and final total
5. Saves to SQLite with auto-generated quotation number
6. Returns { quotation, downloadUrl }
7. User clicks "Download PDF"
8. GET /api/quotations/:id/pdf
9. Puppeteer loads the HTML template with injected data
10. Renders in headless Chrome → exports PDF bytes
11. PDF streamed to browser as a file download
```

---

## 📂 Project Structure

```
quoteforge/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   └── ...
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                   # Express backend
│   ├── src/
│   │   ├── server.js         # App entry point + all routes
│   │   ├── db.js             # SQLite queries & schema init
│   │   ├── pdf.js            # Puppeteer PDF generation
│   │   ├── company.js        # Business defaults & options
│   │   └── utils/
│   │       └── calculations.js  # Pricing logic
│   └── .env.example
│
├── templates/
│   └── quotation.html        # Branded PDF HTML template
│
├── database/
│   ├── schema.sql            # SQLite schema definition
│   └── rentzoo.sqlite        # Local database (gitignored)
│
└── package.json              # Root scripts (dev, build, start)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 22+**
- **npm 10+**
- Google Chrome (if Puppeteer can't auto-download a browser)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/quoteforge.git
cd quoteforge

npm install           # root devDependencies
npm run install:all   # installs server/ and client/ dependencies
```

### 2. Configure Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DATABASE_FILE=database/rentzoo.sqlite

# Only needed if Puppeteer can't download Chrome automatically:
# PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

### 3. Run in Development

```bash
npm run dev
```

| Service        | URL                   |
| -------------- | --------------------- |
| React Frontend | http://localhost:5173 |
| Express API    | http://localhost:5000 |

---

## 🏭 Production Build

```bash
# Build the React app
npm run build

# Start the single production server
npm start
```

The Express server will serve the React app **and** the API from `http://localhost:5000`.

### With PM2 (recommended for VPS)

```bash
npm install -g pm2
pm2 start "npm start" --name quoteforge
pm2 save && pm2 startup
```

---

## 📡 API Reference

| Method | Endpoint                  | Description                                     |
| ------ | ------------------------- | ----------------------------------------------- |
| `GET`  | `/api/health`             | Health check + DB path                          |
| `GET`  | `/api/equipment-options`  | Company defaults, equipment list, scope options |
| `GET`  | `/api/quotations`         | List all saved quotations                       |
| `GET`  | `/api/quotations/:id`     | Get a single quotation with full detail         |
| `POST` | `/api/quotations`         | Create a new quotation                          |
| `GET`  | `/api/quotations/:id/pdf` | Download the quotation as a PDF                 |

### POST `/api/quotations` — Example Body

```json
{
  "clientName": "Acme Infrastructure Ltd.",
  "projectLocation": "Mumbai, Maharashtra",
  "quotationType": "equipment_rental",
  "quoteDate": "2026-11-03",
  "equipmentItems": [
    { "name": "JCB 3DX", "qty": 2, "rate": 18000, "duration": 30 }
  ],
  "gst": { "enabled": true, "percent": 18 },
  "paymentTerms": { "advancePercent": 50 }
}
```

---

## ☁️ Deployment Options

| Platform                     | Supported | Notes                              |
| ---------------------------- | --------- | ---------------------------------- |
| **VPS / EC2 / DigitalOcean** | ✅ Best   | Full SQLite persistence + Chrome   |
| **Google Cloud Run**         | ✅ Good   | Use volume mounts for SQLite       |
| **Railway / Render**         | ✅ Good   | Add Chrome buildpack for Puppeteer |
| **Vercel / Netlify**         | ❌        | Serverless — no Puppeteer support  |

> **Note:** SQLite is file-based. On container/serverless platforms, the database resets on each deploy unless a persistent volume is mounted.

---

## 🔑 Key Engineering Decisions

- **SQLite over PostgreSQL** — Zero-config, file-based DB is perfect for a single-instance internal tool with low concurrent writes
- **Puppeteer for PDF** — Renders the exact same HTML/CSS as the browser, guaranteeing design fidelity without a PDF library DSL
- **Single Express server in production** — Eliminates CORS complexity and simplifies deployment to a single process
- **Server-side normalization** — All inputs are sanitized and defaulted on the server, making the API safe regardless of client behavior

---

## 📄 License

MIT © 2026 — Built with ❤️ for internal business operations.

---

<div align="center">
  <sub>If this project helped you, consider giving it a ⭐</sub>
</div>
