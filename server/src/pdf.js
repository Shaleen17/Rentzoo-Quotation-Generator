const fs = require("node:fs");
const path = require("node:path");
const puppeteer = require("puppeteer");

const projectRoot = path.resolve(__dirname, "..", "..");
const templatePath = path.join(projectRoot, "templates", "quotation.html");
const logoPath = path.join(projectRoot, "server", "assets", "rentzoo-logo.jpeg");
const stampPath = path.join(projectRoot, "server", "assets", "brand-stamp.jpg");
const RUPEE = "&#8377;";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function textToHtml(value) {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function settingsFor(quotation) {
  return quotation.payload.pdfSettings || {};
}

function hasText(value) {
  return String(value ?? "").trim() !== "";
}

function splitLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatBulletText(value) {
  const text = String(value || "").trim();
  const colonIndex = text.indexOf(":");
  if (colonIndex > 0) {
    const label = text.slice(0, colonIndex + 1);
    const rest = text.slice(colonIndex + 1);
    return `<strong>${escapeHtml(label)}</strong>${escapeHtml(rest)}`;
  }
  return escapeHtml(text);
}

function renderBulletList(value) {
  return splitLines(value)
    .map((line) => `<li>${formatBulletText(line)}</li>`)
    .join("");
}

function formatIndian(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0
  }).format(Math.round(Number(value) || 0));
}

function formatRupee(value, withSpace = false) {
  return `${RUPEE}${withSpace ? " " : ""}${formatIndian(value)}`;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function fillTemplate(template, values) {
  return Object.entries(values).reduce((html, [key, value]) => {
    return html.replaceAll(`{{${key}}}`, value ?? "");
  }, template);
}

function normalizeClientLine(quotation) {
  return [quotation.clientName, quotation.projectLocation]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

function footer() {
  return `<footer class="footer">
    <div class="footer-teal"></div>
    <div class="footer-yellow">Branch office: 345 RAGAVENDRA WELFARE, Moosapet, K.V.Rangareddy, Balanagar, Telangana, India, 500018.</div>
  </footer>`;
}

function header(logoDataUri, stampDataUri) {
  return `<header>
    <div class="sample-header">
      <div class="logo-wrap">
        <img class="brand-logo" src="${logoDataUri}" alt="Rent zoo" />
        <span class="tm">TM</span>
      </div>
      <img class="stamp-image" src="${stampDataUri}" alt="Rentzoo brand stamp" />
      <div class="company-block">
        <h1>RENTZOO PRIVATE LIMITED</h1>
        <div class="cin">CIN-U77303TS2026PTC211671</div>
        <p><strong>Registered Office:</strong> 12-9-35/36, Raghavendra</p>
        <p>Colony, Khaitalapur, Moosapet, Kukatpally,</p>
        <p>Hyderabad - 500018</p>
        <p class="strong">phone no: +91 7013708828</p>
        <p><span class="under">Email: Founder@rentzoo.in</span></p>
        <p>Website: <span class="under">www.Rentzoo.in</span></p>
      </div>
    </div>
    <hr class="header-line" />
  </header>`;
}

function page(logoDataUri, stampDataUri, body, className = "") {
  return `<section class="page ${className}">
    ${header(logoDataUri, stampDataUri)}
    ${body}
    ${footer()}
  </section>`;
}

function quoteTitle(value = "QUOTATION: HEAVY EQUIPMENT RENTAL") {
  return `<h2 class="quote-title">${textToHtml(value)}</h2>`;
}

function metaBlock(quotation, dateBold = false) {
  const date = escapeHtml(formatDate(quotation.quoteDate));
  const dateHtml = dateBold ? `<strong>${date}</strong>` : date;
  return `<div class="meta">
    <div><strong>Date:</strong> ${dateHtml}</div>
    <div><strong>From:</strong> Rentzoo Private Limited</div>
    <div><strong>To:</strong> ${escapeHtml(normalizeClientLine(quotation))}</div>
  </div>`;
}

function tableCell(value, className = "") {
  return `<td${className ? ` class="${className}"` : ""}>${value}</td>`;
}

function equipmentLabel(name) {
  const lower = String(name || "").toLowerCase();
  if (lower.includes("jcb")) {
    return "JCB 3DX Backhoe Loader";
  }
  if (lower.includes("tractor")) {
    return "Tractor(Hydralic)";
  }
  if (lower.includes("road roller")) {
    return "Road roller(vibrator)";
  }
  return escapeHtml(name || "");
}

function commercialLabel(item) {
  if (item.commercialDescription) {
    return textToHtml(item.commercialDescription);
  }
  return "";
}

function shiftDuration(name) {
  const lower = String(name || "").toLowerCase();
  if (lower.includes("road roller")) {
    return "Depends";
  }
  return "8 Hrs/Day";
}

function periodText(item) {
  if (item.period) {
    return item.period;
  }
  return "";
}

function rentalDurationText(item) {
  if (item.rentalDuration) {
    return item.rentalDuration;
  }
  return "";
}

function defaultEquipmentItems(quotation) {
  return quotation.calculations.equipmentItems || [];
}

function resourceAllocationTable(items) {
  const rows = items
    .map((item) => {
      return `<tr>
        ${tableCell(`<strong>${equipmentLabel(item.equipmentName)}</strong>`, "left")}
        ${tableCell(`<strong>${escapeHtml(item.quantity)}</strong>`)}
        ${tableCell(`<strong>${textToHtml(item.shiftDuration)}</strong>`)}
        ${tableCell(`<strong>${textToHtml(periodText(item))}</strong>`)}
      </tr>`;
    })
    .join("");

  return `<table class="sample-table compact page-one-table">
    <thead>
      <tr>
        <th>Item Description</th>
        <th style="width: 20%;">Qty</th>
        <th style="width: 24%;">Shift Duration</th>
        <th style="width: 24%;">Period</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function commercialProposalTable(items) {
  const rows = items
    .map((item) => {
      return `<tr>
        ${tableCell(commercialLabel(item), "left")}
        ${tableCell(`<strong>${escapeHtml(item.quantity)}</strong>`)}
        ${tableCell(`<strong>${textToHtml(rentalDurationText(item))}</strong>`)}
        ${tableCell(`<strong>${formatRupee(item.rate)}</strong>`)}
      </tr>`;
    })
    .join("");

  return `<table class="sample-table page-one-table">
    <thead>
      <tr>
        <th>Item Description</th>
        <th style="width: 19%;">Qty</th>
        <th style="width: 24%;">Rental Duration</th>
        <th style="width: 31%;">Monthly Rate (per unit)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function rateDefaults(item) {
  const lower = String(item.equipmentName || "").toLowerCase();
  if (lower.includes("jcb")) {
    return {
      perTrip: "1081/-",
      perDay: "8,648/-",
      perWeek: "51,888/-",
      perMonth: `${formatIndian(item.rate)}/-`
    };
  }
  if (lower.includes("tractor")) {
    return {
      perTrip: "300/-",
      perDay: "4,000/-",
      perWeek: "24,000/-",
      perMonth: `${formatIndian(item.rate)}/-`
    };
  }
  if (lower.includes("road roller")) {
    return {
      perTrip: "-",
      perDay: "13,000/-",
      perWeek: "90,000/-\n(which includes diesel)",
      perMonth: "-"
    };
  }

  const day = Math.round(Number(item.rate) || 0);
  return {
    perTrip: "-",
    perDay: `${formatIndian(day)}/-`,
    perWeek: `${formatIndian(day * 6)}/-`,
    perMonth: `${formatIndian(day * 26)}/-`
  };
}

function rateComparisonTable(items) {
  const rows = items
    .map((item) => {
      return `<tr>
        ${tableCell(`<strong>${equipmentLabel(item.equipmentName).replace(" Backhoe Loader", " Backhoe<br />Loader")}</strong>`)}
        ${tableCell(`<strong>${escapeHtml(item.quantity)}</strong>`)}
        ${tableCell(`<strong>${textToHtml(item.shiftDuration)}</strong>`)}
        ${tableCell(`<strong>${textToHtml(item.perTripCost)}</strong>`)}
        ${tableCell(`<strong>${textToHtml(item.perDayCost)}</strong>`)}
        ${tableCell(`<strong>${textToHtml(item.perWeekCost)}</strong>`)}
        ${tableCell(`<strong>${textToHtml(item.perMonthCost)}</strong>`)}
      </tr>`;
    })
    .join("");

  return `<table class="sample-table rate">
    <thead>
      <tr>
        <th style="width: 15%;">Item<br />Description</th>
        <th style="width: 8%;">Qty</th>
        <th style="width: 13%;">Shift<br />Duration</th>
        <th>Per trip cost<br />(or)<br />per hour cost<br />per vehicle</th>
        <th>Per day cost<br />per vehicle</th>
        <th>Per week cost<br />per vehicle</th>
        <th>per month cost<br />per unit per<br />vehicle</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function unlimitedHours(item) {
  const lower = String(item.equipmentName || "").toLowerCase();
  if (lower.includes("jcb")) {
    return "208/month";
  }
  if (lower.includes("tractor")) {
    return "UNLIMITED TRIPS\n7days";
  }
  if (lower.includes("road roller")) {
    return "7days";
  }
  return "";
}

function totalUnlimitedTable(items) {
  const rows = items
    .map((item) => {
      return `<tr>
        ${tableCell(`<strong>${equipmentLabel(item.equipmentName).replace(" Backhoe Loader", " Backhoe<br />Loader")}</strong>`)}
        ${tableCell(`<strong>${escapeHtml(item.quantity)}</strong>`)}
        ${tableCell(`<strong>${textToHtml(item.totalHoursPerMonth)}</strong>`)}
        ${tableCell(`<strong>${textToHtml(item.amountForEachVehicle)}</strong>`)}
        ${tableCell(`<strong>${formatIndian(item.amount)}/-</strong>`)}
      </tr>`;
    })
    .join("");

  return `<table class="sample-table total">
    <thead>
      <tr>
        <th>Item Description</th>
        <th style="width: 11%;">Qty</th>
        <th>Total hours per<br />month</th>
        <th>Amount for each vechile</th>
        <th>Total amount for all<br />vehicles</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function renderEquipmentPageOne(quotation, logoDataUri, stampDataUri) {
  const items = defaultEquipmentItems(quotation);
  const body = `${quoteTitle()}
    ${metaBlock(quotation, true)}
    <div class="section-title">1. Equipment &amp; Resource Allocation</div>
    ${resourceAllocationTable(items)}
    <div class="section-title">2. Commercial Proposal (All-Inclusive)</div>
    ${commercialProposalTable(items)}`;

  return page(logoDataUri, stampDataUri, body, "equipment-page-one");
}

function renderEquipmentPageTwo(quotation, logoDataUri, stampDataUri) {
  const items = defaultEquipmentItems(quotation);
  const settings = settingsFor(quotation);
  const body = `${rateComparisonTable(items)}
    <div class="note">${textToHtml(settings.roadRollerNote)}</div>
    <div class="unlimited-title">${textToHtml(settings.unlimitedTitle)}</div>
    ${totalUnlimitedTable(items)}
    <div class="total-line">TOTAL AMOUNT ; ${formatIndian(quotation.calculations.finalTotal)}/-</div>
    <p class="all-rates">${textToHtml(settings.allRatesNote)}</p>`;

  return page(logoDataUri, stampDataUri, body, "rate-page");
}

function renderAlternativeLumpPage(quotation, logoDataUri, stampDataUri) {
  const lumpSum = quotation.payload.lumpSum || {};
  const amount = hasText(lumpSum.amountText) || Number(lumpSum.amount) > 0
    ? `${formatIndian(lumpSum.amount)}/-`
    : "";
  const workIncludes = lumpSum.workIncludes || "";
  const executionNote = lumpSum.executionNote || "";
  const dieselNote = lumpSum.dieselNote || "";
  /*
  const oldDieselNote =
    quotation.payload.lumpSum?.dieselNote ||
    "IN THIS 12-LAKH PROJECT, THE ROAD ROLLER WILL REMAIN ON SITE UNTIL THE WORK IS COMPLETED. RENTZOO WILL HANDLE THE DIESEL USAGE (AT A RATE OF 10 LITERS PER HOUR). THEREFORE, IF THE WORK LASTS BETWEEN 40 TO 50 HOURS, THE DIESEL COST WILL TOTAL ₹ 60,000.";
  */
  const riskNote = lumpSum.riskNote || "";
  const body = `<div class="lump-heading">LUM SUM WORK:</div>
    <div class="work-copy">
      <p><strong>The work includes:</strong></p>
      <p>${textToHtml(workIncludes)}</p>
      <p>&nbsp;${textToHtml(executionNote)}</p>
      <div class="lump-cost">LUM SUM COST: <span class="lump-cost-amount">${amount}</span></div>
    </div>
    <p class="lump-note">${textToHtml(dieselNote)}</p>
    <p class="risk-note">${textToHtml(riskNote)}</p>`;

  return page(logoDataUri, stampDataUri, body, "lump-page");
}

function renderServiceScopePage(quotation, logoDataUri, stampDataUri) {
  const settings = settingsFor(quotation);

  const body = `<div class="section-title">3. ${textToHtml(settings.rentzooScopeTitle)}</div>
    <div class="section-body">
      <ul class="sample-list">
        ${renderBulletList(settings.rentzooScopeItems)}
      </ul>
    </div>
    <div class="section-title">4. ${textToHtml(settings.clientScopeTitle)}</div>
    <div class="section-body">
      <ul class="sample-list">
        ${renderBulletList(settings.clientScopeItems)}
      </ul>
    </div>
    <div class="regards">${renderRegards(settings.regardsText)}</div>`;

  return page(logoDataUri, stampDataUri, body, "service-page");
}

function renderRegards(value) {
  const regardsLines = splitLines(value);
  return regardsLines
    .map((line) =>
      line.toLowerCase().includes("rentzoo")
        ? escapeHtml(line).replace(/Rentzoo/gi, "<strong>Rentzoo</strong>")
        : escapeHtml(line)
    )
    .join("<br />");
}

function scopeItemsForLump(quotation) {
  const selected = quotation.payload.scopeOfWork?.selected || [];
  const custom = String(quotation.payload.scopeOfWork?.custom || "").trim();

  const mapped = selected.length
    ? selected.map((item) => {
        if (item === "Soil loading") {
          return "Loading of soil from the designated nearby location provided by the client";
        }
        if (item === "Transportation") {
          return "Transportation of soil to the filling site";
        }
        if (item === "Land filling") {
          return "Filling of land at the specified area";
        }
        if (item === "Leveling") {
          return "Leveling and dressing to achieve required surface level";
        }
        return item;
      })
    : [];

  return [...mapped, custom].filter(Boolean);
}

function termsForLump(quotation) {
  const terms = String(quotation.payload.termsAndConditions || "")
    .split(/\r?\n/)
    .map((term) => term.trim())
    .filter(Boolean);

  return terms;
}

function renderLumpSumDocument(quotation, logoDataUri, stampDataUri) {
  const settings = settingsFor(quotation);
  const lumpSum = quotation.payload.lumpSum || {};
  const calculations = quotation.calculations;
  const payment = calculations.paymentTerms;
  const scopeItems = scopeItemsForLump(quotation)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const terms = termsForLump(quotation)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const projectDuration = lumpSum.projectDuration || "";
  const introText = lumpSum.introText || "";
  const showAmount = hasText(lumpSum.amountText) || Number(lumpSum.amount) > 0;
  const amountText = showAmount ? formatRupee(calculations.lumpSumAmount, true) : "";
  const amountWords = showAmount && calculations.amountInWords
    ? ` (${escapeHtml(calculations.amountInWords)})`
    : "";
  const paymentPayload = quotation.payload.paymentTerms || {};
  const hasAdvanceText = Object.prototype.hasOwnProperty.call(
    paymentPayload,
    "advancePercentText"
  );
  const advanceText = hasAdvanceText
    ? paymentPayload.advancePercentText
    : payment.advancePercent;
  const showAdvance = hasText(advanceText);
  const advancePercent = showAdvance ? `${escapeHtml(advanceText)}%` : "";
  const balancePercent = showAdvance ? `${escapeHtml(payment.balancePercent)}%` : "";
  const balanceLine = showAdvance
    ? `Balance: other ${balancePercent} , after the completion of work`
    : "Balance: ";

  const body = `${quoteTitle(lumpSum.quoteTitle ?? "")}
    ${metaBlock(quotation)}
    <p class="intro">${textToHtml(introText)}</p>

    <div class="section-title">1. ${textToHtml(lumpSum.scopeTitle)}</div>
    <div class="section-body"><ul class="sample-list">${scopeItems}</ul></div>

    <div class="section-title">2. ${textToHtml(lumpSum.contractValueTitle)}</div>
    <div class="section-body"><ul class="sample-list"><li>Total Lump sum Amount: ${amountText}${amountWords}</li></ul></div>

    <div class="section-title">3.${textToHtml(lumpSum.projectDurationTitle)}</div>
    <div class="section-body"><ul class="sample-list"><li>${textToHtml(projectDuration)}</li></ul></div>

    <div class="section-title">4.${textToHtml(lumpSum.paymentTermsTitle)}</div>
    <div class="section-body"><ul class="sample-list">
      <li>Advance: ${advancePercent}</li>
      <li>${balanceLine}</li>
    </ul></div>

    <div class="section-title">5.${textToHtml(lumpSum.termsTitle)}</div>
    <div class="section-body"><ul class="sample-list">${terms}</ul></div>

    <div class="regards">${renderRegards(settings.regardsText)}</div>`;

  return page(logoDataUri, stampDataUri, body, "lump-quote-page");
}

function renderEquipmentDocument(quotation, logoDataUri, stampDataUri) {
  return [
    renderEquipmentPageOne(quotation, logoDataUri, stampDataUri),
    renderEquipmentPageTwo(quotation, logoDataUri, stampDataUri),
    renderAlternativeLumpPage(quotation, logoDataUri, stampDataUri),
    renderServiceScopePage(quotation, logoDataUri, stampDataUri)
  ].join("");
}

function renderQuotationHtml(quotation) {
  const template = fs.readFileSync(templatePath, "utf8");
  const logo = `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString("base64")}`;
  const stamp = `data:image/jpeg;base64,${fs.readFileSync(stampPath).toString("base64")}`;
  const isLumpSum = quotation.calculations.quotationType === "lump_sum";
  const pages = isLumpSum
    ? renderLumpSumDocument(quotation, logo, stamp)
    : renderEquipmentDocument(quotation, logo, stamp);

  return fillTemplate(template, {
    DOCUMENT_TITLE: escapeHtml(`${quotation.quotationNumber} - Rentzoo Quotation`),
    DOCUMENT_PAGES: pages
  });
}

async function generateQuotationPdf(quotation) {
  const launchOptions = {
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.setContent(renderQuotationHtml(quotation), {
      waitUntil: "networkidle0"
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0"
      }
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

module.exports = {
  renderQuotationHtml,
  generateQuotationPdf
};
