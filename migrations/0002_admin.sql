-- Admin system: users and app-level permissions
-- Runs after 0001_initial.sql (FP tables)

CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('super_admin', 'admin', 'user')),
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_permissions (
  email TEXT NOT NULL,
  app_id TEXT NOT NULL CHECK(app_id IN ('kol', 'fp', 'coc')),
  permission TEXT NOT NULL DEFAULT 'user' CHECK(permission IN ('admin', 'user', 'none')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (email, app_id),
  FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_app_permissions_app ON app_permissions(app_id);
CREATE INDEX IF NOT EXISTS idx_app_permissions_email ON app_permissions(email);
