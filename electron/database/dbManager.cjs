const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");

let dbInstance = null;

function getDatabaseDir() {
  const userData = app ? app.getPath("userData") : (process.env.APPDATA ? path.join(process.env.APPDATA, "ascension") : path.join(__dirname, "..", "..", "saves"));
  return path.join(userData, "saves");
}

function getDatabasePath(saveSlug = "universe") {
  return path.join(getDatabaseDir(), `${saveSlug}.db`);
}

function initDatabase(saveSlug = "universe") {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (e) {
      console.warn("[Ascensión DB] Error closing existing instance:", e);
    }
    dbInstance = null;
  }

  const dir = getDatabaseDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const dbPath = getDatabasePath(saveSlug);
  console.log("[Ascensión DB] Abriendo base de datos SQLite en:", dbPath);

  dbInstance = new Database(dbPath, {
    verbose: process.env.NODE_ENV === "development" ? console.log : null,
  });

  // Optimizaciones de rendimiento de grado militar
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.pragma("synchronous = NORMAL");
  dbInstance.pragma("foreign_keys = ON");
  dbInstance.pragma("cache_size = -64000"); // 64 MB de caché en memoria RAM
  dbInstance.pragma("busy_timeout = 5000");

  createSchema(dbInstance);
  return dbInstance;
}

function createSchema(db) {
  const schema = `
    -- Metadatos globales de la partida (legacy, mantenida para compat)
    CREATE TABLE IF NOT EXISTS game_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- ═══════════════════════════════════════════════════════════════
    -- SESIONES DE PARTIDA (reemplaza archivos .json como registro maestro)
    -- ═══════════════════════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      player_name TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 4,
      game_started INTEGER NOT NULL DEFAULT 1,
      game_tick INTEGER NOT NULL DEFAULT 0,
      game_mode TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      -- Estado global serializado (research, stats, policies, diplomacy, etc.)
      global_state_json TEXT NOT NULL DEFAULT '{}'
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_slug ON game_sessions(slug);
    CREATE INDEX IF NOT EXISTS idx_sessions_updated ON game_sessions(updated_at);

    -- ═══════════════════════════════════════════════════════════════
    -- PLANETAS DEL IMPERIO Y IAS
    -- ═══════════════════════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS planets (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      galaxy INTEGER NOT NULL,
      system INTEGER NOT NULL,
      position INTEGER NOT NULL,
      biome TEXT NOT NULL,
      planet_size INTEGER NOT NULL,
      is_ai INTEGER DEFAULT 0,
      data_json TEXT NOT NULL,
      FOREIGN KEY(session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_planets_session ON planets(session_id);
    CREATE INDEX IF NOT EXISTS idx_planets_coords ON planets(galaxy, system, position);
    CREATE INDEX IF NOT EXISTS idx_planets_owner ON planets(owner_id);

    -- ═══════════════════════════════════════════════════════════════
    -- COLAS DE PRODUCCIÓN (build, research, ship, defense, etc.)
    -- ═══════════════════════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS production_queues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      queue_type TEXT NOT NULL,
      data_json TEXT NOT NULL,
      FOREIGN KEY(session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_queues_session ON production_queues(session_id, queue_type);

    -- ═══════════════════════════════════════════════════════════════
    -- REGISTRO NAVAL IMPERIAL
    -- ═══════════════════════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS ships (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      registry_code TEXT UNIQUE NOT NULL,
      custom_name TEXT,
      chassis_id TEXT NOT NULL,
      class_category TEXT NOT NULL,
      origin_planet_id TEXT NOT NULL,
      origin_tick INTEGER NOT NULL,
      owner_id TEXT NOT NULL,
      controller_id TEXT NOT NULL,
      status TEXT NOT NULL,
      current_planet_id TEXT,
      current_fleet_id TEXT,
      hull_percent REAL DEFAULT 1.0,
      veterancy_level INTEGER DEFAULT 0,
      kills_count INTEGER DEFAULT 0,
      battles_survived INTEGER DEFAULT 0,
      tech_generation INTEGER DEFAULT 1,
      metadata_json TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_ships_session ON ships(session_id);
    CREATE INDEX IF NOT EXISTS idx_ships_docked ON ships(current_planet_id, status);
    CREATE INDEX IF NOT EXISTS idx_ships_fleet ON ships(current_fleet_id);
    CREATE INDEX IF NOT EXISTS idx_ships_owner ON ships(owner_id);
    CREATE INDEX IF NOT EXISTS idx_ships_registry ON ships(registry_code);
    CREATE INDEX IF NOT EXISTS idx_ships_chassis ON ships(chassis_id);

    -- Bitácora de Trazabilidad e Historial Selectivo de Naves
    CREATE TABLE IF NOT EXISTS ship_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ship_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      game_tick INTEGER NOT NULL,
      location_desc TEXT NOT NULL,
      details_json TEXT,
      FOREIGN KEY(ship_id) REFERENCES ships(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_logs_ship ON ship_logs(ship_id);

    -- ═══════════════════════════════════════════════════════════════
    -- MISIONES DE FLOTA EN TRÁNSITO
    -- ═══════════════════════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS fleet_missions (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      from_planet_id TEXT NOT NULL,
      to_galaxy INTEGER NOT NULL,
      to_system INTEGER NOT NULL,
      to_position INTEGER NOT NULL,
      mission_type TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      arrival_time INTEGER NOT NULL,
      return_time INTEGER,
      data_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_fleet_missions_session ON fleet_missions(session_id);

    -- ═══════════════════════════════════════════════════════════════
    -- LOGS Y EVENTOS (combat log, spy reports, notifications, etc.)
    -- ═══════════════════════════════════════════════════════════════
    CREATE TABLE IF NOT EXISTS game_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      log_type TEXT NOT NULL,
      game_tick INTEGER,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_game_logs_session ON game_logs(session_id, log_type);
  `;

  db.exec(schema);
}

function getDb() {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

function closeDatabase() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch (e) {
      console.error("[Ascensión DB] Error al cerrar base de datos:", e);
    }
    dbInstance = null;
  }
}

module.exports = {
  initDatabase,
  getDb,
  closeDatabase,
  getDatabasePath,
  getDatabaseDir
};
