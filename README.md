# Rentzoo Quotation Generator

Internal full-stack web app for creating Rentzoo quotation PDFs from a form.

## Features

- Equipment rental and lump-sum quotation flows
- Dynamic equipment rows with amount calculation
- Scope of work, payment terms, GST, and editable conditions
- SQLite quotation history
- Puppeteer PDF generation from an HTML template
- React + Vite + Tailwind dashboard

## Project Structure

```text
client/       React + Vite frontend
server/       Express API and PDF generator
templates/    HTML quotation PDF template
database/     SQLite schema and local database file
```

## Install

```bash
npm install
npm run install:all
```

If Puppeteer cannot download a browser on your network, install Chrome locally and set:

```bash
PUPPETEER_EXECUTABLE_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
```

## Run Locally

```bash
npm run dev
```

Frontend: http://localhost:5173

Backend: http://localhost:5000

## API Endpoints

- `GET /api/health`
- `GET /api/equipment-options`
- `GET /api/quotations`
- `GET /api/quotations/:id`
- `POST /api/quotations`
- `GET /api/quotations/:id/pdf`

## Production Build

```bash
npm run build
npm start
```

After building, the Express server serves the React app from `client/dist`.
