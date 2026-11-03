require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const {
  COMPANY_DETAILS,
  DEFAULT_LUMP_SUM,
  DEFAULT_PDF_SETTINGS,
  DEFAULT_TERMS,
  EQUIPMENT_OPTIONS,
  SCOPE_OPTIONS
} = require("./company");
const {
  countQuotationsForDate,
  databasePath,
  getQuotation,
  getQuotationByNumber,
  insertQuotation,
  listQuotations
} = require("./db");
const { calculateQuotation } = require("./utils/calculations");
const { generateQuotationPdf } = require("./pdf");

const app = express();
const projectRoot = path.resolve(__dirname, "..", "..");
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.CLIENT_URL || true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

function todayInIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function assertRequiredText(value, label) {
  const text = String(value || "").trim();
  if (!text) {
    const error = new Error(`${label} is required.`);
    error.status = 400;
    throw error;
  }
  return text;
}

function optionalText(value) {
  return String(value ?? "").trim();
}

function normalizeQuotationType(value) {
  const text = String(value || "").toLowerCase();
  return text.includes("lump") ? "lump_sum" : "equipment_rental";
}

function normalizeDate(value) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }
  return todayInIndia();
}

function normalizeScope(scope) {
  const selected = Array.isArray(scope?.selected)
    ? scope.selected
        .filter((item) => SCOPE_OPTIONS.includes(item))
        .map((item) => String(item).trim())
    : [];

  return {
    selected,
    custom: String(scope?.custom || "").trim()
  };
}

function normalizePayload(body) {
  const quotationType = normalizeQuotationType(body.quotationType);
  const advancePercent = Number(body.paymentTerms?.advancePercent ?? 0);
  const gstPercent = Number(body.gst?.percent ?? 18);
  const lumpSumAmount = Number(body.lumpSum?.amount ?? 0);

  return {
    clientName: optionalText(body.clientName),
    projectLocation: optionalText(body.projectLocation),
    quoteDate: normalizeDate(body.quoteDate),
    quotationType,
    equipmentItems: Array.isArray(body.equipmentItems) ? body.equipmentItems : [],
    lumpSum: {
      amount: Number.isFinite(lumpSumAmount) ? lumpSumAmount : 0,
      amountText: optionalText(body.lumpSum?.amount),
      quoteTitle: optionalText(body.lumpSum?.quoteTitle),
      introText: optionalText(body.lumpSum?.introText),
      scopeTitle: optionalText(body.lumpSum?.scopeTitle),
      contractValueTitle: optionalText(body.lumpSum?.contractValueTitle),
      projectDurationTitle: optionalText(body.lumpSum?.projectDurationTitle),
      paymentTermsTitle: optionalText(body.lumpSum?.paymentTermsTitle),
      termsTitle: optionalText(body.lumpSum?.termsTitle),
      projectDuration: optionalText(body.lumpSum?.projectDuration),
      workIncludes: optionalText(body.lumpSum?.workIncludes),
      executionNote: optionalText(body.lumpSum?.executionNote),
      dieselNote: optionalText(body.lumpSum?.dieselNote),
      riskNote: optionalText(body.lumpSum?.riskNote)
    },
    scopeOfWork: normalizeScope(body.scopeOfWork),
    paymentTerms: {
      advancePercent: Number.isFinite(advancePercent) ? advancePercent : 0,
      advancePercentText: optionalText(body.paymentTerms?.advancePercent)
    },
    gst: {
      enabled: Boolean(body.gst?.enabled),
      percent: Number.isFinite(gstPercent) ? gstPercent : 18
    },
    pdfSettings: {
      roadRollerNote: optionalText(body.pdfSettings?.roadRollerNote),
      unlimitedTitle: optionalText(body.pdfSettings?.unlimitedTitle),
      allRatesNote: optionalText(body.pdfSettings?.allRatesNote),
      rentzooScopeTitle: optionalText(body.pdfSettings?.rentzooScopeTitle),
      rentzooScopeItems: optionalText(body.pdfSettings?.rentzooScopeItems),
      clientScopeTitle: optionalText(body.pdfSettings?.clientScopeTitle),
      clientScopeItems: optionalText(body.pdfSettings?.clientScopeItems),
      regardsText: optionalText(body.pdfSettings?.regardsText)
    },
    termsAndConditions: optionalText(body.termsAndConditions)
  };
}

function createQuotationNumber(quoteDate) {
  const dateKey = quoteDate.replaceAll("-", "");
  let sequence = countQuotationsForDate(quoteDate) + 1;

  while (sequence < 10000) {
    const quotationNumber = `RZQ-${dateKey}-${String(sequence).padStart(4, "0")}`;
    if (!getQuotationByNumber(quotationNumber)) {
      return quotationNumber;
    }
    sequence += 1;
  }

  throw new Error("Unable to allocate quotation number for the selected date.");
}

function quotationSummary(quotation) {
  return {
    id: quotation.id,
    quotationNumber: quotation.quotationNumber,
    clientName: quotation.clientName,
    projectLocation: quotation.projectLocation,
    quotationType: quotation.quotationType,
    quoteDate: quotation.quoteDate,
    subtotal: quotation.subtotal,
    finalTotal: quotation.finalTotal,
    createdAt: quotation.createdAt,
    downloadUrl: `/api/quotations/${quotation.id}/pdf`
  };
}

function quotationDetail(quotation) {
  return {
    ...quotationSummary(quotation),
    payload: quotation.payload,
    calculations: quotation.calculations,
    updatedAt: quotation.updatedAt
  };
}

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    databasePath
  });
});

app.get("/api/equipment-options", (req, res) => {
  res.json({
    company: COMPANY_DETAILS,
    equipmentOptions: EQUIPMENT_OPTIONS,
    scopeOptions: SCOPE_OPTIONS,
    defaultTerms: DEFAULT_TERMS,
    defaultLumpSum: DEFAULT_LUMP_SUM,
    defaultPdfSettings: DEFAULT_PDF_SETTINGS
  });
});

app.get("/api/quotations", (req, res) => {
  res.json({
    quotations: listQuotations().map(quotationSummary)
  });
});

app.get("/api/quotations/:id", (req, res, next) => {
  try {
    const quotation = getQuotation(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found." });
    }
    return res.json({ quotation: quotationDetail(quotation) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/quotations", (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);
    const calculations = calculateQuotation(payload);
    const quotation = insertQuotation({
      id: randomUUID(),
      quotationNumber: createQuotationNumber(payload.quoteDate),
      payload,
      calculations
    });

    return res.status(201).json({
      quotation: quotationDetail(quotation),
      downloadUrl: `/api/quotations/${quotation.id}/pdf`
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/quotations/:id/pdf", async (req, res, next) => {
  try {
    const quotation = getQuotation(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found." });
    }

    const pdf = await generateQuotationPdf(quotation);
    const filename = `${quotation.quotationNumber}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdf.length);
    return res.send(pdf);
  } catch (error) {
    return next(error);
  }
});

const clientDist = path.join(projectRoot, "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({
    message:
      status >= 500
        ? "Something went wrong while processing the request."
        : error.message
  });
});

app.listen(port, () => {
  console.log(`Rentzoo Quotation API running on http://localhost:${port}`);
});
