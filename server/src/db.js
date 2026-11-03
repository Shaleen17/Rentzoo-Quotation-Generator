const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const projectRoot = path.resolve(__dirname, "..", "..");
const schemaPath = path.join(projectRoot, "database", "schema.sql");
const configuredDatabasePath =
  process.env.DATABASE_FILE || path.join("database", "rentzoo.sqlite");
const databasePath = path.isAbsolute(configuredDatabasePath)
  ? configuredDatabasePath
  : path.resolve(projectRoot, configuredDatabasePath);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);
db.exec(fs.readFileSync(schemaPath, "utf8"));

function parseQuotation(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    quotationNumber: row.quotation_number,
    clientName: row.client_name,
    projectLocation: row.project_location,
    quotationType: row.quotation_type,
    quoteDate: row.quote_date,
    payload: JSON.parse(row.payload),
    calculations: JSON.parse(row.calculations),
    subtotal: row.subtotal,
    finalTotal: row.final_total,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function countQuotationsForDate(quoteDate) {
  const row = db
    .prepare("SELECT COUNT(*) AS total FROM quotations WHERE quote_date = ?")
    .get(quoteDate);
  return row?.total || 0;
}

function getQuotationByNumber(quotationNumber) {
  return parseQuotation(
    db
      .prepare("SELECT * FROM quotations WHERE quotation_number = ?")
      .get(quotationNumber)
  );
}

function insertQuotation(record) {
  db.prepare(
    `INSERT INTO quotations (
      id,
      quotation_number,
      client_name,
      project_location,
      quotation_type,
      quote_date,
      payload,
      calculations,
      subtotal,
      final_total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    record.id,
    record.quotationNumber,
    record.payload.clientName,
    record.payload.projectLocation,
    record.calculations.quotationType,
    record.payload.quoteDate,
    JSON.stringify(record.payload),
    JSON.stringify(record.calculations),
    record.calculations.subtotal,
    record.calculations.finalTotal
  );

  return getQuotation(record.id);
}

function getQuotation(id) {
  return parseQuotation(
    db.prepare("SELECT * FROM quotations WHERE id = ?").get(id)
  );
}

function listQuotations() {
  return db
    .prepare(
      `SELECT *
       FROM quotations
       ORDER BY created_at DESC, quotation_number DESC`
    )
    .all()
    .map(parseQuotation);
}

module.exports = {
  countQuotationsForDate,
  getQuotationByNumber,
  insertQuotation,
  getQuotation,
  listQuotations,
  databasePath
};
