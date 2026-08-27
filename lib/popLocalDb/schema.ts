export const POP_LOCAL_SCHEMA_VERSION = 4
export const POP_LOCAL_DB_DIR = "rootsy-pop-db"

export function popLocalDbFileName(popId: string): string {
  return `pop_${popId}.sqlite`
}

export const POP_LOCAL_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  barcode TEXT,
  sku TEXT,
  item_kind TEXT NOT NULL,
  category_id TEXT,
  category_name TEXT NOT NULL DEFAULT '',
  sale_price REAL NOT NULL,
  iva REAL NOT NULL DEFAULT 0,
  discount_mode TEXT,
  discount_value REAL,
  unit_of_measure TEXT NOT NULL DEFAULT 'unidad',
  is_sellable INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  allow_negative_stock INTEGER NOT NULL DEFAULT 0,
  stock_on_hand REAL NOT NULL DEFAULT 0,
  list_prices TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS articles_category_id ON articles (category_id);
CREATE INDEX IF NOT EXISTS articles_barcode ON articles (barcode);
CREATE INDEX IF NOT EXISTS articles_name ON articles (name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS articles_sale_board
  ON articles (is_active, is_sellable, item_kind, stock_on_hand);

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  category_id TEXT,
  category_name TEXT NOT NULL DEFAULT '',
  sale_price REAL NOT NULL,
  iva REAL NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  allow_negative_stock INTEGER NOT NULL DEFAULT 0,
  station_id TEXT,
  list_prices TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS recipes_category_id ON recipes (category_id);
CREATE INDEX IF NOT EXISTS recipes_name ON recipes (name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS recipe_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  show_in_menu INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 1,
  station_id TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS recipe_categories_menu
  ON recipe_categories (is_active, show_in_menu, sort_order, name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  promotion_type TEXT NOT NULL,
  pricing_mode TEXT NOT NULL,
  fixed_price REAL,
  discount_mode TEXT,
  discount_value REAL,
  buy_quantity INTEGER,
  benefit_quantity INTEGER,
  benefit_discount_pct REAL,
  apply_benefit_to TEXT,
  auto_apply INTEGER NOT NULL DEFAULT 0,
  show_in_menu INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  valid_from TEXT,
  valid_until TEXT,
  valid_time_start TEXT,
  valid_time_end TEXT,
  schedule_days TEXT NOT NULL DEFAULT '[]',
  slots TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS promotions_menu
  ON promotions (is_active, show_in_menu, sort_order);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  item_kind TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  show_in_sale INTEGER NOT NULL DEFAULT 1,
  visible INTEGER NOT NULL DEFAULT 1,
  show_in_menu INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS categories_sale_board
  ON categories (item_kind, show_in_sale, sort_order, name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS sale_cart_lines (
  line_id TEXT PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  product_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  quantity REAL NOT NULL,
  snapshot_name TEXT NOT NULL,
  snapshot_price REAL NOT NULL,
  snapshot_price_original REAL,
  snapshot_image TEXT,
  snapshot_description TEXT,
  snapshot_iva REAL,
  snapshot_category TEXT,
  snapshot_discount_mode TEXT,
  snapshot_discount_value REAL,
  comment TEXT NOT NULL DEFAULT '',
  discount_mode TEXT,
  discount_draft TEXT NOT NULL DEFAULT '',
  discount_suppressed INTEGER NOT NULL DEFAULT 0,
  promotion_selections TEXT NOT NULL DEFAULT '[]',
  paid_locked INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS sale_cart_lines_sort ON sale_cart_lines (sort_order, line_id);
`

export const POP_LOCAL_DROP_SQL = `
DROP TABLE IF EXISTS sale_cart_lines;
DROP TABLE IF EXISTS recipe_categories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS meta;
`
