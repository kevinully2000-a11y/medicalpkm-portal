-- Fountain Pen Companion - Initial Schema
-- Database: medicalpkm-fp (Cloudflare D1)

CREATE TABLE IF NOT EXISTS pens (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  line TEXT DEFAULT '',
  model TEXT NOT NULL,
  nib_size TEXT DEFAULT '',
  nib_material TEXT DEFAULT '',
  nib_grind TEXT DEFAULT '',
  filling TEXT DEFAULT '',
  price REAL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'In Collection',
  purchase_date TEXT,
  store TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  url TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inks (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '',
  volume TEXT DEFAULT '',
  price REAL,
  currency TEXT DEFAULT 'USD',
  notes TEXT DEFAULT '',
  url TEXT DEFAULT '',
  properties TEXT DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pairings (
  id TEXT PRIMARY KEY,
  pen_id TEXT NOT NULL,
  ink_id TEXT NOT NULL,
  rating INTEGER,
  verdict TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  is_active INTEGER DEFAULT 0,
  paired_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (pen_id) REFERENCES pens(id),
  FOREIGN KEY (ink_id) REFERENCES inks(id)
);

CREATE TABLE IF NOT EXISTS dropdowns (
  category TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (category, value)
);

CREATE INDEX IF NOT EXISTS idx_pens_brand ON pens(brand);
CREATE INDEX IF NOT EXISTS idx_pens_status ON pens(status);
CREATE INDEX IF NOT EXISTS idx_inks_brand ON inks(brand);
CREATE INDEX IF NOT EXISTS idx_pairings_active ON pairings(is_active);
CREATE INDEX IF NOT EXISTS idx_pairings_pen ON pairings(pen_id);
CREATE INDEX IF NOT EXISTS idx_pairings_ink ON pairings(ink_id);
