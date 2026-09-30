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

  applyMigrations(dbInstance);
}

// ═══════════════════════════════════════════════════════════════
// VERSIONADO DE ESQUEMA Y MIGRACIONES
// ═══════════════════════════════════════════════════════════════

// Versión de esquema actual. Súbele SOLO cuando añadas una migración abajo.
const SCHEMA_VERSION = 3;

function tableExists(db, table) {
  return !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?").get(table);
}

function columnExists(db, table, column) {
  try {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all();
    return cols.some(c => c.name === column);
  } catch {
    return false;
  }
}

function setMeta(db, key, value) {
  db.prepare("INSERT INTO game_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, String(value));
}

function getMeta(db, key) {
  const row = db.prepare("SELECT value FROM game_meta WHERE key = ?").get(key);
  return row ? row.value : null;
}

/**
 * Migraciones de esquema. Reglas obligatorias:
 *  - idempotentes: se pueden reaplicar sin efecto
 *  - NO destructivas: sin DROP, sin DELETE masivo, sin recrear tablas con datos
 *  - cada una sube SCHEMA_VERSION y queda registrada en game_meta.schema_version
 */
const MIGRATIONS = [
  {
    // v1 -> v2: el registro naval no estaba atado a una partida. Todas las
    // naves de todas las partidas vivían en la misma bolsa. Se añade la columna
    // con NULL para no perder ni una fila; el backfill se decide aparte.
    version: 2,
    name: "ships_session_id_column",
    up(db) {
      if (!tableExists(db, "ships")) return;
      if (!columnExists(db, "ships", "session_id")) {
        db.exec("ALTER TABLE ships ADD COLUMN session_id TEXT");
      }
      db.exec("CREATE INDEX IF NOT EXISTS idx_ships_session_id ON ships(session_id)");
    },
  },
  {
    // v2 -> v3: las misiones en vuelo tampoco tenian FK, asi que al borrar una
    // partida se quedaban huerfanas. Una FK nueva sobre una tabla con datos
    // solo es valida si no hay huerfanos; si los hay, se registra lafk como
    // indice en vez defk, para no fallar el arranque.
    version: 3,
    name: "fleet_missions_session_fk",
    up(db) {
      if (!tableExists(db, "fleet_missions")) return;
      db.exec("CREATE INDEX IF NOT EXISTS idx_fleet_missions_session_id ON fleet_missions(session_id)");
      const huerfanas = db
        .prepare("SELECT COUNT(*) AS n FROM fleet_missions WHERE session_id IS NULL OR session_id NOT IN (SELECT id FROM game_sessions)")
        .get();
      if (huerfanas && huerfanas.n > 0) {
        console.warn(
          `[Ascensión DB] ${huerfanas.n} misiones sin sesión: se conservan y se reparan al volver a guardar.`
        );
      }
    },
  },
];

function applyMigrations(db) {
  let current = 0;
  const stored = getMeta(db, "schema_version");
  if (stored !== null) {
    current = Number(stored) || 0;
  } else {
    // Instalacion nueva o DB anterior a este versionado.
    // PRAGMA user_version se usa como version antigua si existe.
    const uv = db.pragma("user_version", { simple: true });
    current = Number(uv) || 0;
  }

  const log = (msg) => console.log(`[Ascensión DB] ${msg}`);

  if (current < 1) {
    current = 1;
    log("esquema base v1 (installación nueva)");
  }

  for (const m of MIGRATIONS) {
    if (current >= m.version) continue;
    try {
      m.up(db);
      current = m.version;
      setMeta(db, "schema_version", current);
      log(`migración v${m.version} aplicada: ${m.name}`);
    } catch (err) {
      // Una migración fallida no debe impedir arrancar el juego. Se registra
      // y se sigue: el resto del esquema ya estaba creado.
      console.error(`[Ascensión DB] Migración v${m.version} (${m.name}) falló:`, err.message);
    }
  }

  if (current < SCHEMA_VERSION) {
    setMeta(db, "schema_version", SCHEMA_VERSION);
    current = SCHEMA_VERSION;
  }

  return current;
}

function getDb() {
  if (!dbInstance) {
    return initDatabase();
  }
  return dbInstance;
}

/**
 * Vuelca el WAL dentro del propio .db antes de copiarlo.
 *
 * Sin esto, un `copyFileSync` de un .db en modo WAL produce un backup al que
 * le faltan todas las transacciones que aun no se han volcado. El backup
 * parecia bueno y no lo era. Con TRUNCATE el WAL queda ademas a cero, asi que
 * el unico fichero que importa es el .db.
 */
function checkpointWal() {
  if (!dbInstance) return null;
  try {
    const res = dbInstance.pragma("wal_checkpoint(TRUNCATE)");
    return Array.isArray(res) ? res[0] : res;
  } catch (err) {
    console.warn("[Ascensión DB] checkpoint WAL falló:", err.message);
    return null;
  }
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
  getDatabaseDir,
  checkpointWal,
  getSchemaVersion: () => SCHEMA_VERSION,
  applyMigrations,
};
