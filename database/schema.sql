CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  quotation_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  project_location TEXT NOT NULL,
  quotation_type TEXT NOT NULL CHECK (quotation_type IN ('equipment_rental', 'lump_sum')),
  quote_date TEXT NOT NULL,
  payload TEXT NOT NULL,
  calculations TEXT NOT NULL,
  subtotal REAL NOT NULL,
  final_total REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quotations_created_at
  ON quotations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quotations_quote_date
  ON quotations(quote_date);

CREATE TRIGGER IF NOT EXISTS trg_quotations_updated_at
AFTER UPDATE ON quotations
FOR EACH ROW
BEGIN
  UPDATE quotations SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
