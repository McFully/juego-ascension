const { getDb } = require("./dbManager.cjs");
const crypto = require("crypto");

// ═══════════════════════════════════════════════════════════════
// gameRepository.cjs — Repositorio unificado de persistencia SQLite
// Reemplaza la lectura/escritura de archivos .json por operaciones SQL
// ═══════════════════════════════════════════════════════════════

function generateSessionId() {
  return `ses_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

function now() {
  return new Date().toISOString();
}

// Claves del state global que NO se guardan como tablas separadas
// (se serializan dentro de global_state_json)
const GLOBAL_STATE_KEYS = [
  "research", "stats", "governmentPolicies", "debrisField",
  "achievements", "fleetPresets", "activeEvent", "influence",
  "reputation", "galacticCouncil", "federations", "federalFleet",
  "diplomaticHistory", "activeCrises", "ministries", "clans",
  "galacticEvents", "tradeRoutes", "leaders", "relics",
  "adventureLogs", "eventLog", "totalAICount", "blueprints",
  "combatLog", "spyReports", "events", "notifications",
  "activeEvents", "tacticalEvents", "activeMissions", "completedMissions",
  "imperialCouncil", "chatMessages", "sectors",
];

// Claves de colas de producción que se guardan en production_queues
const QUEUE_KEYS = [
  "buildQueue", "researchQueue", "shipQueue", "defenseQueue",
  "customShipQueue", "retrofitQueue", "shipyardQueue", "missileQueue",
];

// ═══════════════════════════════════════════════════════════════
// GUARDAR PARTIDA COMPLETA
// ═══════════════════════════════════════════════════════════════
function saveFullGameState(slug, state) {
  const db = getDb();
  const sessionId = state._sessionId || generateSessionId();
  const timestamp = now();

  // Extraer estado global (todo menos planetas, aiPlanets, colas y fleetMissions)
  const globalState = {};
  for (const key of GLOBAL_STATE_KEYS) {
    if (state[key] !== undefined) {
      globalState[key] = state[key];
    }
  }

  const runSave = db.transaction(() => {
    // 1. Upsert sesión
    db.prepare(`
      INSERT INTO game_sessions (id, slug, player_name, version, game_started, game_tick, game_mode, created_at, updated_at, global_state_json)
      VALUES (@id, @slug, @playerName, @version, @gameStarted, @gameTick, @gameMode, @createdAt, @updatedAt, @globalStateJson)
      ON CONFLICT(slug) DO UPDATE SET
        player_name = @playerName,
        version = @version,
        game_started = @gameStarted,
        game_tick = @gameTick,
        game_mode = @gameMode,
        updated_at = @updatedAt,
        global_state_json = @globalStateJson
    `).run({
      id: sessionId,
      slug,
      playerName: state.playerName || "Comandante",
      version: 4,
      gameStarted: state.gameStarted ? 1 : 0,
      gameTick: state.gameTick || 0,
      gameMode: state.gameMode || null,
      createdAt: state._createdAt || timestamp,
      updatedAt: timestamp,
      globalStateJson: JSON.stringify(globalState),
    });

    // Recuperar el ID real (podría ser el existente si slug ya existía)
    const session = db.prepare("SELECT id FROM game_sessions WHERE slug = ?").get(slug);
    const sid = session.id;

    // 2. Limpiar datos anteriores de esta sesión
    db.prepare("DELETE FROM planets WHERE session_id = ?").run(sid);
    db.prepare("DELETE FROM production_queues WHERE session_id = ?").run(sid);

    // 3. Insertar planetas del jugador
    const planetStmt = db.prepare(`
      INSERT INTO planets (id, session_id, owner_id, name, galaxy, system, position, biome, planet_size, is_ai, data_json)
      VALUES (@id, @sessionId, @ownerId, @name, @galaxy, @system, @position, @biome, @planetSize, @isAi, @dataJson)
    `);

    if (Array.isArray(state.planets)) {
      for (const p of state.planets) {
        planetStmt.run({
          id: p.id,
          sessionId: sid,
          ownerId: "player",
          name: p.name || "Colonia",
          galaxy: p.galaxy || 1,
          system: p.system || 1,
          position: p.position || 1,
          biome: p.biome || "temperate",
          planetSize: p.planetSize || 100,
          isAi: 0,
          dataJson: JSON.stringify(p),
        });
      }
    }

    // 4. Insertar planetas IA
    if (Array.isArray(state.aiPlanets)) {
      for (const ai of state.aiPlanets) {
        planetStmt.run({
          id: ai.id,
          sessionId: sid,
          ownerId: ai.faction || "ai",
          name: ai.name || "Mundo IA",
          galaxy: ai.galaxy || 1,
          system: ai.system || 1,
          position: ai.position || 1,
          biome: ai.biome || "barren",
          planetSize: ai.planetSize || 100,
          isAi: 1,
          dataJson: JSON.stringify(ai),
        });
      }
    }

    // 5. Insertar colas de producción
    const queueStmt = db.prepare(`
      INSERT INTO production_queues (session_id, queue_type, data_json)
      VALUES (?, ?, ?)
    `);

    for (const queueKey of QUEUE_KEYS) {
      const queueData = state[queueKey];
      if (Array.isArray(queueData) && queueData.length > 0) {
        queueStmt.run(sid, queueKey, JSON.stringify(queueData));
      }
    }

    // 6. Fleet missions
    if (Array.isArray(state.fleetMissions) && state.fleetMissions.length > 0) {
      // Limpiar misiones anteriores de esta sesión
      db.prepare("DELETE FROM fleet_missions WHERE session_id = ?").run(sid);
      const missionStmt = db.prepare(`
        INSERT OR REPLACE INTO fleet_missions (id, session_id, from_planet_id, to_galaxy, to_system, to_position, mission_type, start_time, arrival_time, return_time, data_json)
        VALUES (@id, @sessionId, @fromPlanetId, @toGalaxy, @toSystem, @toPosition, @missionType, @startTime, @arrivalTime, @returnTime, @dataJson)
      `);

      for (const m of state.fleetMissions) {
        missionStmt.run({
          id: m.id || `fm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          sessionId: sid,
          fromPlanetId: m.fromPlanetId || m.from || "",
          toGalaxy: m.toGalaxy || m.galaxy || 1,
          toSystem: m.toSystem || m.system || 1,
          toPosition: m.toPosition || m.position || 1,
          missionType: m.missionType || m.type || "attack",
          startTime: m.startTime || m.departureTime || 0,
          arrivalTime: m.arrivalTime || 0,
          returnTime: m.returnTime || null,
          dataJson: JSON.stringify(m),
        });
      }
    }

    return { sessionId: sid, slug };
  });

  return runSave();
}

// ═══════════════════════════════════════════════════════════════
// CARGAR PARTIDA COMPLETA
// ═══════════════════════════════════════════════════════════════
function loadFullGameState(slug) {
  const db = getDb();

  const session = db.prepare("SELECT * FROM game_sessions WHERE slug = ?").get(slug);
  if (!session) {
    return null;
  }

  const globalState = JSON.parse(session.global_state_json || "{}");

  // Cargar planetas del jugador
  const playerPlanets = db.prepare(
    "SELECT data_json FROM planets WHERE session_id = ? AND is_ai = 0 ORDER BY rowid"
  ).all(session.id);

  // Cargar planetas IA
  const aiPlanets = db.prepare(
    "SELECT data_json FROM planets WHERE session_id = ? AND is_ai = 1 ORDER BY rowid"
  ).all(session.id);

  // Cargar colas de producción
  const queues = db.prepare(
    "SELECT queue_type, data_json FROM production_queues WHERE session_id = ?"
  ).all(session.id);

  // Cargar fleet missions
  const missions = db.prepare(
    "SELECT data_json FROM fleet_missions WHERE session_id = ?"
  ).all(session.id);

  // Reconstruir el state completo
  const state = {
    ...globalState,
    _sessionId: session.id,
    _saveSlug: session.slug,
    _saveName: session.player_name,
    _createdAt: session.created_at,
    version: session.version,
    playerName: session.player_name,
    gameStarted: session.game_started === 1,
    gameTick: session.game_tick,
    gameMode: session.game_mode || undefined,
    planets: playerPlanets.map(row => JSON.parse(row.data_json)),
    aiPlanets: aiPlanets.map(row => JSON.parse(row.data_json)),
    fleetMissions: missions.map(row => JSON.parse(row.data_json)),
  };

  // Restaurar colas
  for (const q of queues) {
    state[q.queue_type] = JSON.parse(q.data_json);
  }

  // Asegurar colas vacías si no existen en DB
  for (const queueKey of QUEUE_KEYS) {
    if (!state[queueKey]) {
      state[queueKey] = [];
    }
  }

  return state;
}

// ═══════════════════════════════════════════════════════════════
// LISTAR SESIONES (reemplaza lectura de directorio de .json)
// ═══════════════════════════════════════════════════════════════
function listGameSessions() {
  const db = getDb();
  const sessions = db.prepare(`
    SELECT slug, player_name, version, game_tick, updated_at,
      (SELECT COUNT(*) FROM planets WHERE session_id = game_sessions.id AND is_ai = 0) as planet_count
    FROM game_sessions
    ORDER BY updated_at DESC
  `).all();

  return sessions.map(s => ({
    slug: s.slug,
    name: s.player_name,
    mtime: new Date(s.updated_at).getTime(),
    planetCount: s.planet_count,
    version: s.version,
    gameTick: s.game_tick,
  }));
}

// ═══════════════════════════════════════════════════════════════
// ELIMINAR SESIÓN
// ═══════════════════════════════════════════════════════════════
function deleteGameSession(slug) {
  const db = getDb();
  const session = db.prepare("SELECT id FROM game_sessions WHERE slug = ?").get(slug);
  if (!session) return { success: false, error: "Sesión no encontrada" };

  db.prepare("DELETE FROM game_sessions WHERE id = ?").run(session.id);
  // CASCADE eliminará planets, production_queues, game_logs asociados
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════
// RENOMBRAR SESIÓN
// ═══════════════════════════════════════════════════════════════
function renameGameSession(oldSlug, newName, newSlug) {
  const db = getDb();
  const session = db.prepare("SELECT id FROM game_sessions WHERE slug = ?").get(oldSlug);
  if (!session) return { success: false, error: "Sesión no encontrada" };

  // Verificar que el nuevo slug no exista (si cambió)
  if (newSlug !== oldSlug) {
    const existing = db.prepare("SELECT id FROM game_sessions WHERE slug = ?").get(newSlug);
    if (existing) return { success: false, error: "Ya existe una partida con ese nombre" };
  }

  // Actualizar global_state_json con el nuevo playerName
  const currentJson = db.prepare("SELECT global_state_json FROM game_sessions WHERE id = ?").get(session.id);
  const globalState = JSON.parse(currentJson.global_state_json || "{}");
  // No necesitamos tocar el globalState, playerName vive en la columna

  db.prepare(`
    UPDATE game_sessions
    SET slug = ?, player_name = ?, updated_at = ?
    WHERE id = ?
  `).run(newSlug, newName.trim(), now(), session.id);

  return { success: true, slug: newSlug };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTAR A JSON (para export manual a disco)
// ═══════════════════════════════════════════════════════════════
function exportSessionToJson(slug) {
  const state = loadFullGameState(slug);
  if (!state) return null;

  // Limpiar campos internos
  const exportData = { ...state };
  delete exportData._sessionId;
  delete exportData._createdAt;
  exportData.version = 3; // Exportar como v3 para compatibilidad
  return exportData;
}

// ═══════════════════════════════════════════════════════════════
// IMPORTAR DESDE JSON (para import desde disco)
// ═══════════════════════════════════════════════════════════════
function importSessionFromJson(jsonData, slug) {
  return saveFullGameState(slug, jsonData);
}

// ═══════════════════════════════════════════════════════════════
// VERIFICAR SI SLUG EXISTE
// ═══════════════════════════════════════════════════════════════
function sessionExists(slug) {
  const db = getDb();
  const row = db.prepare("SELECT 1 FROM game_sessions WHERE slug = ? LIMIT 1").get(slug);
  return !!row;
}

module.exports = {
  saveFullGameState,
  loadFullGameState,
  listGameSessions,
  deleteGameSession,
  renameGameSession,
  exportSessionToJson,
  importSessionFromJson,
  sessionExists,
  generateSessionId,
  QUEUE_KEYS,
  GLOBAL_STATE_KEYS,
};
